import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class AsaasWebhookPaymentDto {
  @IsString()
  id: string;

  @IsString()
  status: string;

  value: number;

  customer?: string;

  subscription?: string;
}

export class AsaasWebhookDto {
  @ApiProperty({ example: 'PAYMENT_CONFIRMED' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ description: 'Payment object from Asaas' })
  @IsObject()
  payment: AsaasWebhookPaymentDto;
}
