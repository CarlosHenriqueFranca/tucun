import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SuggestionOrmEntity } from '../../infrastructure/persistence/suggestion.orm-entity';
import { SuggestionVoteOrmEntity } from '../../infrastructure/persistence/suggestion-vote.orm-entity';

export interface VoteResult {
  voted: boolean;
  upvotes: number;
}

@Injectable()
export class VoteSuggestionUseCase {
  constructor(
    @InjectRepository(SuggestionOrmEntity)
    private readonly suggestionRepo: Repository<SuggestionOrmEntity>,
    @InjectRepository(SuggestionVoteOrmEntity)
    private readonly voteRepo: Repository<SuggestionVoteOrmEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(suggestionId: string, userId: string): Promise<VoteResult> {
    const suggestion = await this.suggestionRepo.findOne({
      where: { id: suggestionId, isPublic: true },
    });

    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    const now = new Date();
    if (suggestion.votingEndsAt < now) {
      throw new BadRequestException('Voting period has ended for this suggestion');
    }

    const existingVote = await this.voteRepo.findOne({
      where: { suggestionId, userId },
    });

    if (existingVote) {
      throw new ConflictException('You have already voted on this suggestion');
    }

    const vote = this.voteRepo.create({ suggestionId, userId });
    await this.voteRepo.save(vote);

    await this.suggestionRepo.increment({ id: suggestionId }, 'upvotes', 1);

    const updated = await this.suggestionRepo.findOne({
      where: { id: suggestionId },
    });

    // Award 5 XP to the suggestion creator
    this.eventEmitter.emit('gamification.xp.award', {
      userId: suggestion.userId,
      amount: 5,
      reason: 'SUGGESTION_VOTE_RECEIVED',
      referenceId: suggestionId,
    });

    return { voted: true, upvotes: updated?.upvotes ?? suggestion.upvotes + 1 };
  }

  async removeVote(suggestionId: string, userId: string): Promise<VoteResult> {
    const suggestion = await this.suggestionRepo.findOne({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    const existingVote = await this.voteRepo.findOne({
      where: { suggestionId, userId },
    });

    if (!existingVote) {
      throw new NotFoundException('You have not voted on this suggestion');
    }

    await this.voteRepo.remove(existingVote);

    if (suggestion.upvotes > 0) {
      await this.suggestionRepo.decrement({ id: suggestionId }, 'upvotes', 1);
    }

    const updated = await this.suggestionRepo.findOne({
      where: { id: suggestionId },
    });

    return { voted: false, upvotes: updated?.upvotes ?? Math.max(0, suggestion.upvotes - 1) };
  }
}
