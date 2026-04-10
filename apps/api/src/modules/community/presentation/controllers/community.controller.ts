import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../../../../shared/guards/optional-jwt.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { CreateSuggestionUseCase } from '../../application/use-cases/create-suggestion.use-case';
import { GetSuggestionsUseCase } from '../../application/use-cases/get-suggestions.use-case';
import { VoteSuggestionUseCase } from '../../application/use-cases/vote-suggestion.use-case';
import { AddDevCommentUseCase } from '../../application/use-cases/add-dev-comment.use-case';
import { CreateSuggestionDto } from '../../application/dtos/create-suggestion.dto';
import { DevFeedbackDto } from '../../application/dtos/dev-feedback.dto';
import { SuggestionCategory, SuggestionStatus } from '../../infrastructure/persistence/suggestion.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuggestionOrmEntity } from '../../infrastructure/persistence/suggestion.orm-entity';

@ApiTags('Community')
@Controller('suggestions')
export class CommunityController {
  constructor(
    private readonly createSuggestionUseCase: CreateSuggestionUseCase,
    private readonly getSuggestionsUseCase: GetSuggestionsUseCase,
    private readonly voteSuggestionUseCase: VoteSuggestionUseCase,
    private readonly addDevCommentUseCase: AddDevCommentUseCase,
    @InjectRepository(SuggestionOrmEntity)
    private readonly suggestionRepo: Repository<SuggestionOrmEntity>,
  ) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Get paginated list of suggestions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: SuggestionStatus })
  @ApiQuery({ name: 'category', required: false, enum: SuggestionCategory })
  async getSuggestions(
    @CurrentUser() user: CurrentUserPayload | null,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: SuggestionStatus,
    @Query('category') category?: SuggestionCategory,
  ) {
    return this.getSuggestionsUseCase.execute({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      category,
      userId: user?.sub,
    });
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new suggestion' })
  @ApiResponse({ status: 201, description: 'Suggestion created' })
  async createSuggestion(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateSuggestionDto,
  ) {
    return this.createSuggestionUseCase.execute(user.sub, dto);
  }

  @Get(':id')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Get suggestion detail' })
  async getSuggestion(
    @CurrentUser() user: CurrentUserPayload | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const suggestion = await this.suggestionRepo.findOne({
      where: { id, isPublic: true },
      relations: ['votes'],
    });

    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    const now = new Date();
    const msRemaining = suggestion.votingEndsAt.getTime() - now.getTime();
    const daysRemaining = Math.max(
      0,
      Math.ceil(msRemaining / (1000 * 60 * 60 * 24)),
    );

    let hasVoted = false;
    if (user?.sub) {
      hasVoted = suggestion.votes?.some((v) => v.userId === user.sub) ?? false;
    }

    // Hide private dev comment from non-admins
    const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
    if (!isAdmin && !suggestion.devCommentIsPublic) {
      suggestion.devComment = null;
    }

    return { suggestion, hasVoted, daysRemaining };
  }

  @Post(':id/vote')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Vote on a suggestion' })
  async voteSuggestion(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.voteSuggestionUseCase.execute(id, user.sub);
  }

  @Delete(':id/vote')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove vote from suggestion' })
  async removeVote(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.voteSuggestionUseCase.removeVote(id, user.sub);
  }

  @Patch(':id/feedback')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add developer feedback (admin/moderator only)' })
  async addDevFeedback(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DevFeedbackDto,
  ) {
    return this.addDevCommentUseCase.execute(id, dto, user.role);
  }
}
