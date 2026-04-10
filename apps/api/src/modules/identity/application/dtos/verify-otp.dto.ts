import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: '5511987654321',
    description: 'WhatsApp phone number with country code',
  })
  @IsString()
  @IsNotEmpty({ message: 'WhatsApp number is required' })
  @Matches(/^\d{10,15}$/, {
    message: 'WhatsApp must be a valid phone number (10-15 digits)',
  })
  whatsapp: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code sent via WhatsApp',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  code: string;
}
