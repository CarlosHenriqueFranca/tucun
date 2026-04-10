import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateFishLogDto {
  @ApiProperty({
    description: 'UUID of the fish species caught',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  speciesId: string;

  @ApiPropertyOptional({
    description: 'UUID of the fishing spot where the catch occurred',
  })
  @IsOptional()
  @IsUUID('4')
  spotId?: string;

  @ApiPropertyOptional({ description: 'Size of the fish in centimeters' })
  @IsOptional()
  @IsInt()
  @Min(1)
  sizeCm?: number;

  @ApiPropertyOptional({ description: 'Weight of the fish in kilograms' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'Whether the fish was released after being caught',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  wasReleased?: boolean = true;

  @ApiPropertyOptional({ description: 'Optional notes about the catch' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'URL of the catch photo' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Date and time when the fish was caught (ISO 8601)',
    example: '2025-11-15T08:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  caughtAt?: string;
}
