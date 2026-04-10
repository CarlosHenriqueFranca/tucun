import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBadgeOrmEntity } from '../../infrastructure/persistence/user-badge.orm-entity';
import { BadgeRarity } from '../../infrastructure/persistence/badge.orm-entity';

export interface UserBadgesResult {
  badges: UserBadgeOrmEntity[];
  rarityBreakdown: Record<BadgeRarity, number>;
  total: number;
}

@Injectable()
export class GetUserBadgesUseCase {
  constructor(
    @InjectRepository(UserBadgeOrmEntity)
    private readonly userBadgeRepository: Repository<UserBadgeOrmEntity>,
  ) {}

  async execute(userId: string): Promise<UserBadgesResult> {
    const badges = await this.userBadgeRepository.find({
      where: { userId },
      order: { awardedAt: 'DESC' },
    });

    const rarityBreakdown: Record<BadgeRarity, number> = {
      [BadgeRarity.COMMON]: 0,
      [BadgeRarity.UNCOMMON]: 0,
      [BadgeRarity.RARE]: 0,
      [BadgeRarity.EPIC]: 0,
      [BadgeRarity.LEGENDARY]: 0,
      [BadgeRarity.SPECIAL]: 0,
    };

    for (const ub of badges) {
      if (ub.badge?.rarity) {
        rarityBreakdown[ub.badge.rarity] = (rarityBreakdown[ub.badge.rarity] ?? 0) + 1;
      }
    }

    return { badges, rarityBreakdown, total: badges.length };
  }
}
