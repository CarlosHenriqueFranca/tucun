import {
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dtos/login.dto';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { TokenService } from '../services/token.service';
import { UserEntity } from '../../domain/entities/user.entity';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    role: string;
    subscriptionTier: string;
    xpTotal: number;
    level: number;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResponse> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses social login. Please sign in with Google or Facebook.',
      );
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account has been suspended');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update login stats
    user.recordLogin();
    await this.userRepository.update(user);

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair(
      this.buildPayload(user),
    );

    // Store refresh token
    await this.tokenService.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        xpTotal: user.xpTotal,
        level: user.level,
      },
    };
  }

  private buildPayload(user: UserEntity) {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString() ?? null,
      trialUsedAt: user.trialUsedAt?.toISOString() ?? null,
    };
  }
}
