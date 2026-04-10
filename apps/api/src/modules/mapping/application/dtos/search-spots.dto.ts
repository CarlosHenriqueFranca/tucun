import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { SpotType } from '../../infrastructure/persistence/fishing-spot.orm-entity';

export class SearchSpotsDto {
  @ApiProperty({ example: -3.71839 })
  @IsLatitude()
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ example: -38.5434 })
  @IsLongitude()
  @Type(() => Number)
  longitude: number;

  @ApiPropertyOptional({ example: 50000, description: 'Radius in meters, default 50km' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500000)
  @Type(() => Number)
  radius?: number;

  @ApiPropertyOptional({ enum: SpotType })
  @IsOptional()
  @IsEnum(SpotType)
  type?: SpotType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
