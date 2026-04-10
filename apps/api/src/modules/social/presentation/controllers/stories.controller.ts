import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../../../shared/decorators/current-user.decorator';
import { CreateStoryUseCase, CreateStoryDto } from '../../application/use-cases/create-story.use-case';
import { GetStoriesUseCase } from '../../application/use-cases/get-stories.use-case';
import { StoryOrmEntity } from '../../infrastructure/persistence/story.orm-entity';

@ApiTags('social')
@Controller('stories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StoriesController {
  constructor(
    private readonly createStoryUseCase: CreateStoryUseCase,
    private readonly getStoriesUseCase: GetStoriesUseCase,
    @InjectRepository(StoryOrmEntity)
    private readonly storyRepository: Repository<StoryOrmEntity>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get active stories from followed users' })
  async getStories(@CurrentUser() user: CurrentUserPayload) {
    return this.getStoriesUseCase.execute(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new story' })
  async createStory(
    @Body() dto: CreateStoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.createStoryUseCase.execute(dto, user.sub);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Record a view on a story' })
  async recordView(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() _user: CurrentUserPayload,
  ) {
    await this.storyRepository.increment({ id }, 'viewsCount', 1);
    return { message: 'View recorded' };
  }
}
