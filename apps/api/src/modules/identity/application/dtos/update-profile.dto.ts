import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'João Silva', description: 'User display name' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name is too long' })
  name?: string;

  @ApiPropertyOptional({ example: 'joao_pesca', description: 'Unique username' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username may only contain letters, numbers, and underscores',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'Pescador apaixonado do rio São Francisco', description: 'User bio' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio is too long (max 500 characters)' })
  bio?: string;

  @ApiPropertyOptional({ example: 'Belo Horizonte', description: 'User city' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'City name is too long' })
  city?: string;

  @ApiPropertyOptional({ example: 'MG', description: 'User state (Brazilian UF)' })
  @IsOptional()
  @IsString()
  @MaxLength(2, { message: 'State should be a 2-letter Brazilian UF code' })
  @Matches(/^[A-Z]{2}$/, { message: 'State must be a 2-letter uppercase code (e.g., SP, MG)' })
  state?: string;

  @ApiPropertyOptional({ example: 'https://cdn.tucun.app/avatars/uuid.jpg', description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;
}
