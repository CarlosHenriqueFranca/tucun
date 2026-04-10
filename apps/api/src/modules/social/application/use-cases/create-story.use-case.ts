import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoryOrmEntity } from '../../infrastructure/persistence/story.orm-entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiProperty({ enum: ['image', 'video'] })
  @IsEnum(['image', 'video'])
  mediaType: 'image' | 'video';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string;
}

@Injectable()
export class CreateStoryUseCase {
  constructor(
    @InjectRepository(StoryOrmEntity)
    private readonly storyRepository: Repository<StoryOrmEntity>,
  ) {}

  async execute(dto: CreateStoryDto, userId: string): Promise<StoryOrmEntity> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = this.storyRepository.create({
      userId,
      mediaUrl: dto.mediaUrl,
      mediaType: dto.mediaType,
      caption: dto.caption ?? null,
      viewsCount: 0,
      expiresAt,
    });

    return this.storyRepository.save(story);
  }
}
