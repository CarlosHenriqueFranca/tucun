import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuggestionOrmEntity } from '../../infrastructure/persistence/suggestion.orm-entity';
import { DevFeedbackDto } from '../dtos/dev-feedback.dto';

@Injectable()
export class AddDevCommentUseCase {
  constructor(
    @InjectRepository(SuggestionOrmEntity)
    private readonly suggestionRepo: Repository<SuggestionOrmEntity>,
  ) {}

  async execute(
    suggestionId: string,
    dto: DevFeedbackDto,
    userRole: string,
  ): Promise<SuggestionOrmEntity> {
    if (userRole !== 'admin' && userRole !== 'moderator') {
      throw new ForbiddenException(
        'Only admins and moderators can add developer feedback',
      );
    }

    const suggestion = await this.suggestionRepo.findOne({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    suggestion.devComment = dto.comment;
    suggestion.devCommentIsPublic = dto.isPublic;

    if (dto.status) {
      suggestion.status = dto.status;
    }

    return this.suggestionRepo.save(suggestion);
  }
}
