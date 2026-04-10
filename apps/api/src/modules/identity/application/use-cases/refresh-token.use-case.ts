import {
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { TokenService, TokenPayload } from '../services/token.service';

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<RefreshResponse> {
    const { refreshToken } = dto;

    // Verify JWT signature and expiry
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.sub;

    // Verify token is in Redis whitelist
    const isValid = await this.tokenService.isRefreshTokenValid(userId, refreshToken);
    if (!isValid) {
      // Token has been invalidated (logout or rotation)
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Fetch fresh user data
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive || user.isBlocked) {
      throw new UnauthorizedException('User account is unavailable');
    }

    // Invalidate old refresh token (rotation)
    await this.tokenService.invalidateRefreshToken(userId, refreshToken);

    // Issue new token pair
    const newTokens = this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString() ?? null,
      trialUsedAt: user.trialUsedAt?.toISOString() ?? null,
    });

    // Store new refresh token
    await this.tokenService.storeRefreshToken(user.id, newTokens.refreshToken);

    return newTokens;
  }
}
