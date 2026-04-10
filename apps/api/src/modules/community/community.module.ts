import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuggestionOrmEntity } from './infrastructure/persistence/suggestion.orm-entity';
import { SuggestionVoteOrmEntity } from './infrastructure/persistence/suggestion-vote.orm-entity';
import { CreateSuggestionUseCase } from './application/use-cases/create-suggestion.use-case';
import { GetSuggestionsUseCase } from './application/use-cases/get-suggestions.use-case';
import { VoteSuggestionUseCase } from './application/use-cases/vote-suggestion.use-case';
import { AddDevCommentUseCase } from './application/use-cases/add-dev-comment.use-case';
import { CommunityController } from './presentation/controllers/community.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuggestionOrmEntity, SuggestionVoteOrmEntity]),
  ],
  controllers: [CommunityController],
  providers: [
    CreateSuggestionUseCase,
    GetSuggestionsUseCase,
    VoteSuggestionUseCase,
    AddDevCommentUseCase,
  ],
})
export class CommunityModule {}
