import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SpotType } from '../../infrastructure/persistence/fishing-spot.orm-entity';

export class CreateSpotDto {
  @ApiProperty({ example: 'Ponto do Tucunaré' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Excelente ponto de pesca de tucunaré' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SpotType, example: SpotType.PONTO_DE_PESCA })
  @IsEnum(SpotType)
  type: SpotType;

  @ApiProperty({ example: -3.71839 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: -38.5434 })
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({ example: 'Fortaleza' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @ApiPropertyOptional({ example: 'CE' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;
}
