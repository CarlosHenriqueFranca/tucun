import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@email.com', description: 'User email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SenhaForte@123', description: 'Password (minimum 8 characters)' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password is too long' })
  password: string;

  @ApiProperty({ example: 'João Silva', description: 'User full name' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name is too long' })
  name: string;

  @ApiPropertyOptional({ example: '5511987654321', description: 'WhatsApp number with country code' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,15}$/, { message: 'WhatsApp must be a valid phone number (10-15 digits, no spaces)' })
  whatsapp?: string;

  @ApiPropertyOptional({ example: 'joao_pesca', description: 'Unique username (3-30 chars, alphanumeric + underscore)' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must be at most 30 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username may only contain letters, numbers, and underscores' })
  username?: string;
}
