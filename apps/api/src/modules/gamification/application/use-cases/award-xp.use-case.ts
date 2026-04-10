import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { XpEventOrmEntity } from '../../infrastructure/persistence/xp-event.orm-entity';
import { UserBadgeOrmEntity } from '../../infrastructure/persistence/user-badge.orm-entity';
import { BadgeOrmEntity } from '../../infrastructure/persistence/badge.orm-entity';
import { CheckBadgeConditionsUseCase } from './check-badge-conditions.use-case';

export const XP_REWARDS: Record<string, number> = {
  CHECK_IN: 50,
  POST_PHOTO: 10,
  POST_VIDEO: 20,
  FIRST_CATCH: 100,
  DAILY_LOGIN: 5,
  COMPLETE_CHECKLIST: 30,
  REPORT_ALERT: 25,
  REVIEW_SPOT: 15,
  INVITE_FRIEND: 200,
  SHARE_POST: 5,
};

export const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Iniciante', xp: 0 },
  { level: 2, name: 'Aprendiz', xp: 500 },
  { level: 3, name: 'Pescador', xp: 1500 },
  { level: 4, name: 'Explorador', xp: 3500 },
  { level: 5, name: 'Desbravador', xp: 7500 },
  { level: 6, name: 'Veterano', xp: 15000 },
  { level: 7, name: 'Mestre', xp: 30000 },
  { level: 8, name: 'Lenda', xp: 55000 },
  { level: 9, name: 'Grande Mestre', xp: 90000 },
  { level: 10, name: 'Tucunaré Lenda', xp: 150000 },
];

export function getLevelForXp(xp: number): { level: number; name: string } {
  let current = LEVEL_THRESHOLDS[0];
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xp) {
      current = threshold;
    } else {
      break;
    }
  }
  return { level: current.level, name: current.name };
}

export class LevelUpEvent {
  constructor(
    public readonly userId: string,
    public readonly newLevel: number,
    public readonly levelName: string,
  ) {}
}

export interface AwardXpInput {
  userId: string;
  eventType: string;
  xpAmount?: number;
  metadata?: Record<string, unknown>;
}

export interface AwardXpResult {
  newTotal: number;
  levelUp: boolean;
  newLevel?: number;
  newLevelName?: string;
  newBadges: UserBadgeOrmEntity[];
}

@Injectable()
export class AwardXpUseCase {
  private readonly logger = new Logger(AwardXpUseCase.name);

  constructor(
    @InjectRepository(XpEventOrmEntity)
    private readonly xpEventRepository: Repository<XpEventOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly checkBadgeConditionsUseCase: CheckBadgeConditionsUseCase,
  ) {}

  async execute(input: AwardXpInput): Promise<AwardXpResult> {
    const { userId, eventType, metadata } = input;
    const xpAmount = input.xpAmount ?? XP_REWARDS[eventType] ?? 0;

    // Record XP event
    const xpEvent = this.xpEventRepository.create({
      userId,
      eventType,
      xpAmount,
      metadata: metadata ?? null,
    });
    await this.xpEventRepository.save(xpEvent);

    // Get current user XP
    const userResult = await this.dataSource.query<{ xp_total: number; id: string }[]>(
      'SELECT id, xp_total FROM users WHERE id = $1',
      [userId],
    );

    if (!userResult.length) {
      this.logger.warn(`User ${userId} not found when awarding XP`);
      return { newTotal: xpAmount, levelUp: false, newBadges: [] };
    }

    const currentXp = Number(userResult[0].xp_total ?? 0);
    const previousLevel = getLevelForXp(currentXp);
    const newTotal = currentXp + xpAmount;
    const newLevelInfo = getLevelForXp(newTotal);

    // Update user XP
    await this.dataSource.query('UPDATE users SET xp_total = $1 WHERE id = $2', [newTotal, userId]);

    const levelUp = newLevelInfo.level > previousLevel.level;

    if (levelUp) {
      this.eventEmitter.emit(
        'gamification.level_up',
        new LevelUpEvent(userId, newLevelInfo.level, newLevelInfo.name),
      );
    }

    const newBadges = await this.checkBadgeConditionsUseCase.execute(userId, newTotal);

    return {
      newTotal,
      levelUp,
      newLevel: levelUp ? newLevelInfo.level : undefined,
      newLevelName: levelUp ? newLevelInfo.name : undefined,
      newBadges,
    };
  }
}
