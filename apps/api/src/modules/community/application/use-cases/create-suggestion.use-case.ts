import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SuggestionOrmEntity } from '../../infrastructure/persistence/suggestion.orm-entity';
import { CreateSuggestionDto } from '../dtos/create-suggestion.dto';

@Injectable()
export class CreateSuggestionUseCase {
  constructor(
    @InjectRepository(SuggestionOrmEntity)
    private readonly suggestionRepo: Repository<SuggestionOrmEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    dto: CreateSuggestionDto,
  ): Promise<SuggestionOrmEntity> {
    const votingEndsAt = new Date();
    votingEndsAt.setDate(votingEndsAt.getDate() + 30);

    const suggestion = this.suggestionRepo.create({
      userId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      votingEndsAt,
      upvotes: 0,
      isPublic: true,
      devComment: null,
      devCommentIsPublic: false,
    });

    const saved = await this.suggestionRepo.save(suggestion);

    // Award 10 XP for submitting a suggestion
    this.eventEmitter.emit('gamification.xp.award', {
      userId,
      amount: 10,
      reason: 'SUGGESTION_CREATED',
      referenceId: saved.id,
    });

    return saved;
  }
}
