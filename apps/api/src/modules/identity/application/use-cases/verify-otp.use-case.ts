import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { TokenService } from '../services/token.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { REDIS_CLIENT } from '../../../../shared/modules/redis.module';
import Redis from 'ioredis';

export interface OtpVerifyResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: {
    id: string;
    name: string;
    username: string;
    whatsapp: string;
    subscriptionTier: string;
    trialUsedAt: Date | null;
  };
}

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async execute(dto: VerifyOtpDto): Promise<OtpVerifyResponse> {
    const { whatsapp, code } = dto;

    // Get OTP from Redis
    const otpKey = `otp:${whatsapp}`;
    const storedCode = await this.redis.get(otpKey);

    if (!storedCode) {
      throw new UnauthorizedException('OTP expired or not found. Please request a new one.');
    }

    if (storedCode !== code) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Delete OTP after successful verification (single use)
    await this.redis.del(otpKey);

    // Find or create user by whatsapp
    let user = await this.userRepository.findByWhatsapp(whatsapp);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new UserEntity({
        id: uuidv4(),
        email: `${whatsapp}@whatsapp.tucun.app`, // placeholder email
        whatsapp,
        name: `Pescador ${whatsapp.slice(-4)}`,
        username: await this.generateUsername(whatsapp),
        providersLinked: ['whatsapp'],
      });

      user.isPhoneVerified = true;
      user.startTrial();

      user = await this.userRepository.create(user);

      this.eventEmitter.emit(
        UserRegisteredEvent.EVENT_NAME,
        new UserRegisteredEvent(
          user.id,
          user.email,
          user.name,
          user.whatsapp,
          'whatsapp',
        ),
      );
    } else {
      // Mark phone as verified on subsequent logins
      if (!user.isPhoneVerified) {
        user.isPhoneVerified = true;
      }
      user.recordLogin();
      await this.userRepository.update(user);
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Account has been suspended');
    }

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      trialUsedAt: user.trialUsedAt?.toISOString() ?? null,
    });

    await this.tokenService.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        whatsapp: user.whatsapp!,
        subscriptionTier: user.subscriptionTier,
        trialUsedAt: user.trialUsedAt,
      },
    };
  }

  private async generateUsername(whatsapp: string): Promise<string> {
    const base = `pescador_${whatsapp.slice(-4)}`;
    const exists = await this.userRepository.existsByUsername(base);
    if (!exists) return base;

    for (let i = 0; i < 10; i++) {
      const candidate = `${base}_${Math.floor(Math.random() * 999)}`;
      const candidateExists = await this.userRepository.existsByUsername(candidate);
      if (!candidateExists) return candidate;
    }

    return `user_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
  }
}
