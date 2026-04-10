import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePostDto {
  @ApiPropertyOptional({ example: 'Bela pescaria hoje!' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ type: [String], example: ['https://cdn.tucun.app/img.jpg'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  mediaUrls: string[];

  @ApiProperty({ type: [String], enum: ['image', 'video'], example: ['image'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(['image', 'video'], { each: true })
  mediaTypes: ('image' | 'video')[];

  @ApiPropertyOptional({ example: 'uuid-spot-id' })
  @IsOptional()
  @IsUUID()
  spotId?: string;

  @ApiPropertyOptional({ example: 'uuid-species-id' })
  @IsOptional()
  @IsUUID()
  fishSpeciesId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic?: boolean;
}
