import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SuggestionOrmEntity,
  SuggestionCategory,
  SuggestionStatus,
} from '../../infrastructure/persistence/suggestion.orm-entity';
import { SuggestionVoteOrmEntity } from '../../infrastructure/persistence/suggestion-vote.orm-entity';

export interface GetSuggestionsInput {
  page?: number;
  limit?: number;
  status?: SuggestionStatus;
  category?: SuggestionCategory;
  userId?: string; // current user for hasVoted check
}

export interface SuggestionWithMeta {
  suggestion: SuggestionOrmEntity;
  hasVoted: boolean;
  daysRemaining: number;
}

export interface PaginatedSuggestions {
  items: SuggestionWithMeta[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetSuggestionsUseCase {
  constructor(
    @InjectRepository(SuggestionOrmEntity)
    private readonly suggestionRepo: Repository<SuggestionOrmEntity>,
    @InjectRepository(SuggestionVoteOrmEntity)
    private readonly voteRepo: Repository<SuggestionVoteOrmEntity>,
  ) {}

  async execute(input: GetSuggestionsInput): Promise<PaginatedSuggestions> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const skip = (page - 1) * limit;

    const query = this.suggestionRepo
      .createQueryBuilder('s')
      .where('s.isPublic = true');

    if (input.status) {
      query.andWhere('s.status = :status', { status: input.status });
    }

    if (input.category) {
      query.andWhere('s.category = :category', { category: input.category });
    }

    query.orderBy('s.upvotes', 'DESC').skip(skip).take(limit);

    const [suggestions, total] = await query.getManyAndCount();

    const now = new Date();
    const items: SuggestionWithMeta[] = await Promise.all(
      suggestions.map(async (suggestion) => {
        let hasVoted = false;
        if (input.userId) {
          const vote = await this.voteRepo.findOne({
            where: { suggestionId: suggestion.id, userId: input.userId },
          });
          hasVoted = !!vote;
        }

        const msRemaining = suggestion.votingEndsAt.getTime() - now.getTime();
        const daysRemaining = Math.max(
          0,
          Math.ceil(msRemaining / (1000 * 60 * 60 * 24)),
        );

        return { suggestion, hasVoted, daysRemaining };
      }),
    );

    return { items, total, page, limit };
  }
}
