import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: '5511987654321',
    description: 'WhatsApp phone number with country code (digits only)',
  })
  @IsString()
  @IsNotEmpty({ message: 'WhatsApp number is required' })
  @Matches(/^\d{10,15}$/, {
    message: 'WhatsApp must be a valid phone number (10-15 digits, no spaces or special chars)',
  })
  whatsapp: string;
}
