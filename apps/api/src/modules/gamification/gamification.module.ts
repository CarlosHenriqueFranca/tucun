import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeOrmEntity } from './infrastructure/persistence/badge.orm-entity';
import { UserBadgeOrmEntity } from './infrastructure/persistence/user-badge.orm-entity';
import { XpEventOrmEntity } from './infrastructure/persistence/xp-event.orm-entity';
import { AwardXpUseCase } from './application/use-cases/award-xp.use-case';
import { CheckBadgeConditionsUseCase } from './application/use-cases/check-badge-conditions.use-case';
import { GetLeaderboardUseCase } from './application/use-cases/get-leaderboard.use-case';
import { GetUserBadgesUseCase } from './application/use-cases/get-user-badges.use-case';
import { GamificationController } from './presentation/controllers/gamification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BadgeOrmEntity, UserBadgeOrmEntity, XpEventOrmEntity]),
  ],
  controllers: [GamificationController],
  providers: [
    AwardXpUseCase,
    CheckBadgeConditionsUseCase,
    GetLeaderboardUseCase,
    GetUserBadgesUseCase,
  ],
  exports: [AwardXpUseCase],
})
export class GamificationModule {}
