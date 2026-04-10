import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { BadgeOrmEntity } from '../../infrastructure/persistence/badge.orm-entity';
import { UserBadgeOrmEntity } from '../../infrastructure/persistence/user-badge.orm-entity';

@Injectable()
export class CheckBadgeConditionsUseCase {
  private readonly logger = new Logger(CheckBadgeConditionsUseCase.name);

  constructor(
    @InjectRepository(BadgeOrmEntity)
    private readonly badgeRepository: Repository<BadgeOrmEntity>,
    @InjectRepository(UserBadgeOrmEntity)
    private readonly userBadgeRepository: Repository<UserBadgeOrmEntity>,
  ) {}

  async execute(userId: string, currentXp: number): Promise<UserBadgeOrmEntity[]> {
    // Get all badges user already has
    const earnedBadges = await this.userBadgeRepository.find({
      where: { userId },
      select: ['badgeId'],
    });
    const earnedBadgeIds = earnedBadges.map((ub) => ub.badgeId);

    // Get all badges not yet earned by the user
    const unearnedBadges = earnedBadgeIds.length
      ? await this.badgeRepository.find({
          where: { id: Not(In(earnedBadgeIds)) },
        })
      : await this.badgeRepository.find();

    const newUserBadges: UserBadgeOrmEntity[] = [];

    for (const badge of unearnedBadges) {
      if (this.isBadgeConditionMet(badge, currentXp)) {
        try {
          const userBadge = this.userBadgeRepository.create({
            userId,
            badgeId: badge.id,
            isNew: true,
          });
          const saved = await this.userBadgeRepository.save(userBadge);
          saved.badge = badge;
          newUserBadges.push(saved);
        } catch (error) {
          // Unique constraint: badge already awarded (race condition), skip
          this.logger.debug(`Badge ${badge.id} already awarded to user ${userId}`);
        }
      }
    }

    return newUserBadges;
  }

  private isBadgeConditionMet(badge: BadgeOrmEntity, currentXp: number): boolean {
    if (badge.xpRequired > 0 && currentXp >= badge.xpRequired) {
      return true;
    }

    if (!badge.conditionType || !badge.conditionValue) {
      return false;
    }

    switch (badge.conditionType) {
      case 'xp_threshold':
        return currentXp >= (badge.conditionValue['threshold'] as number ?? 0);
      default:
        return false;
    }
  }
}
