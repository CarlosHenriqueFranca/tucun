import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { SendOtpDto } from '../dtos/send-otp.dto';
import { ZApiService } from '../services/zapi.service';
import { REDIS_CLIENT } from '../../../../shared/modules/redis.module';
import Redis from 'ioredis';

@Injectable()
export class SendOtpUseCase {
  private readonly OTP_TTL_SECONDS = 5 * 60; // 5 minutes
  private readonly OTP_RATE_LIMIT_TTL = 60; // 1 minute
  private readonly OTP_RATE_LIMIT_MAX = 3; // max 3 sends per minute

  constructor(
    private readonly zapiService: ZApiService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async execute(dto: SendOtpDto): Promise<{ message: string }> {
    const { whatsapp } = dto;

    // Rate limiting: max 3 OTPs per minute per number
    const rateLimitKey = `otp_rate:${whatsapp}`;
    const sentCount = await this.redis.incr(rateLimitKey);
    if (sentCount === 1) {
      await this.redis.expire(rateLimitKey, this.OTP_RATE_LIMIT_TTL);
    }
    if (sentCount > this.OTP_RATE_LIMIT_MAX) {
      throw new BadRequestException(
        'Too many OTP requests. Please wait a moment before trying again.',
      );
    }

    // Generate 6-digit OTP
    const code = this.generateOtp();

    // Store in Redis with TTL
    const otpKey = `otp:${whatsapp}`;
    await this.redis.set(otpKey, code, 'EX', this.OTP_TTL_SECONDS);

    // Send via Z-API WhatsApp
    await this.zapiService.sendOtp(whatsapp, code);

    return {
      message: 'OTP sent successfully. Valid for 5 minutes.',
    };
  }

  private generateOtp(): string {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
  }
}
