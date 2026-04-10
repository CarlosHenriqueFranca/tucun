import { Injectable, Logger, Inject } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '../../../../shared/modules/redis.module';
import Redis from 'ioredis';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  subscriptionTier: string;
  subscriptionExpiresAt?: string | null;
  trialUsedAt?: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  generateAccessToken(payload: TokenPayload): string {
    const options: JwtSignOptions = {
      secret: this.configService.get<string>('jwt.accessSecret'),
    };
    const expiresIn = this.configService.get<string>('jwt.accessExpiresIn', '15m');
    if (expiresIn) {
      // Cast required because @nestjs/jwt uses ms StringValue type
      (options as Record<string, unknown>)['expiresIn'] = expiresIn;
    }
    return this.jwtService.sign(payload, options);
  }

  generateRefreshToken(payload: TokenPayload): string {
    const options: JwtSignOptions = {
      secret: this.configService.get<string>('jwt.refreshSecret'),
    };
    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn', '30d');
    if (expiresIn) {
      (options as Record<string, unknown>)['expiresIn'] = expiresIn;
    }
    return this.jwtService.sign(payload, options);
  }

  generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  async storeRefreshToken(userId: string, token: string): Promise<void> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    const ttlSeconds = 30 * 24 * 60 * 60; // 30 days

    // Store as a set to allow multiple devices
    await this.redis.sadd(key, token);
    await this.redis.expire(key, ttlSeconds);
  }

  async invalidateRefreshToken(userId: string, token: string): Promise<void> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    await this.redis.srem(key, token);
  }

  async invalidateAllRefreshTokens(userId: string): Promise<void> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    await this.redis.del(key);
  }

  async isRefreshTokenValid(userId: string, token: string): Promise<boolean> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    const isMember = await this.redis.sismember(key, token);
    return isMember === 1;
  }

  verifyAccessToken(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token, {
      secret: this.configService.get<string>('jwt.accessSecret'),
    });
  }

  verifyRefreshToken(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
    });
  }
}
