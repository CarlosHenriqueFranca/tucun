import { Injectable } from '@nestjs/common';
import { TokenService } from '../services/token.service';

export interface LogoutInput {
  userId: string;
  refreshToken?: string;
  logoutAll?: boolean;
}

@Injectable()
export class LogoutUseCase {
  constructor(private readonly tokenService: TokenService) {}

  async execute(input: LogoutInput): Promise<{ message: string }> {
    const { userId, refreshToken, logoutAll } = input;

    if (logoutAll) {
      // Invalidate all sessions for this user
      await this.tokenService.invalidateAllRefreshTokens(userId);
      return { message: 'Logged out from all devices successfully' };
    }

    if (refreshToken) {
      // Invalidate only the provided refresh token
      await this.tokenService.invalidateRefreshToken(userId, refreshToken);
    } else {
      // Invalidate all if no specific token provided
      await this.tokenService.invalidateAllRefreshTokens(userId);
    }

    return { message: 'Logged out successfully' };
  }
}
