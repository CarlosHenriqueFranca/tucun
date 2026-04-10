import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SuggestionStatus } from '../../infrastructure/persistence/suggestion.orm-entity';

export class DevFeedbackDto {
  @ApiProperty({
    description: 'Developer comment on the suggestion',
    example: 'Excelente ideia! Vamos implementar na versão 2.0.',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({
    description: 'Whether the comment is visible to all users',
    example: true,
  })
  @IsBoolean()
  isPublic: boolean;

  @ApiPropertyOptional({
    description: 'Update the suggestion status',
    enum: SuggestionStatus,
  })
  @IsOptional()
  @IsEnum(SuggestionStatus)
  status?: SuggestionStatus;
}
