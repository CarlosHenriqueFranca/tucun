import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Array of participant user IDs',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];

  @ApiPropertyOptional({
    description: 'Name for group chat',
    example: 'Pescadores do Rio Madeira',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a group conversation',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isGroup?: boolean = false;
}
