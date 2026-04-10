import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { SuggestionCategory } from '../../infrastructure/persistence/suggestion.orm-entity';

export class CreateSuggestionDto {
  @ApiProperty({
    description: 'Suggestion title (10-100 characters)',
    minLength: 10,
    maxLength: 100,
    example: 'Adicionar mapa de correntes',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Detailed description (20-500 characters)',
    minLength: 20,
    maxLength: 500,
    example: 'Seria ótimo ter um mapa mostrando as correntes do rio para ajudar a escolher os melhores pontos.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({
    description: 'Category of the suggestion',
    enum: SuggestionCategory,
    default: SuggestionCategory.FEATURE,
  })
  @IsEnum(SuggestionCategory)
  category: SuggestionCategory = SuggestionCategory.FEATURE;
}
