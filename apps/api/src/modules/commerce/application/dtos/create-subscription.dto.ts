import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsIn } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ enum: ['monthly', 'annual'], example: 'monthly' })
  @IsEnum(['monthly', 'annual'])
  plan: 'monthly' | 'annual';

  @ApiProperty({ enum: ['pix', 'credit_card'], example: 'pix' })
  @IsEnum(['pix', 'credit_card'])
  paymentMethod: 'pix' | 'credit_card';

  @ApiPropertyOptional({
    description: 'Number of installments (1 for PIX, 1 or 10 for annual credit card)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsIn([1, 10])
  installments?: number;
}
