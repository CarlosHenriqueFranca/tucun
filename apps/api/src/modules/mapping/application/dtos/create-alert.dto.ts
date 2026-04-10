import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  AlertCategory,
  DangerLevel,
} from '../../infrastructure/persistence/route-alert.orm-entity';

export class CreateAlertDto {
  @ApiProperty({ example: 'Banco de areia bloqueando canal' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Canal bloqueado no km 45, desviar pela margem direita' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: AlertCategory, example: AlertCategory.BANCO_AREIA })
  @IsEnum(AlertCategory)
  category: AlertCategory;

  @ApiProperty({ enum: DangerLevel, example: DangerLevel.HIGH })
  @IsEnum(DangerLevel)
  dangerLevel: DangerLevel;

  @ApiProperty({ example: -3.71839 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: -38.5434 })
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({ example: 200, description: 'Radius in meters' })
  @IsOptional()
  @IsInt()
  @Min(1)
  radius?: number;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
