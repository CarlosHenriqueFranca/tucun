import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FishLogOrmEntity } from '../../infrastructure/persistence/fish-log.orm-entity';
import { CreateFishLogDto } from '../dtos/create-fish-log.dto';

export const BASE_CATCH_XP = 30;
export const FIRST_CATCH_BONUS_XP = 20;

export interface FishLogResult {
  log: FishLogOrmEntity;
  xpAwarded: number;
  isFirstCatch: boolean;
}

@Injectable()
export class CreateFishLogUseCase {
  constructor(
    @InjectRepository(FishLogOrmEntity)
    private readonly fishLogRepo: Repository<FishLogOrmEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, dto: CreateFishLogDto): Promise<FishLogResult> {
    // Check if this is the first time the user catches this species
    const previousCatch = await this.fishLogRepo.findOne({
      where: { userId, speciesId: dto.speciesId },
    });

    const isFirstCatch = !previousCatch;

    const log = this.fishLogRepo.create({
      userId,
      speciesId: dto.speciesId,
      spotId: dto.spotId ?? null,
      sizeCm: dto.sizeCm ?? null,
      weightKg: dto.weightKg ?? null,
      wasReleased: dto.wasReleased ?? true,
      notes: dto.notes ?? null,
      photoUrl: dto.photoUrl ?? null,
      caughtAt: dto.caughtAt ? new Date(dto.caughtAt) : new Date(),
    });

    const savedLog = await this.fishLogRepo.save(log);

    const xpAwarded = BASE_CATCH_XP + (isFirstCatch ? FIRST_CATCH_BONUS_XP : 0);

    this.eventEmitter.emit('gamification.xp.award', {
      userId,
      amount: xpAwarded,
      reason: isFirstCatch ? 'FISH_LOG_FIRST_CATCH' : 'FISH_LOG_CREATED',
      referenceId: savedLog.id,
    });

    if (isFirstCatch) {
      this.eventEmitter.emit('gamification.achievement.check', {
        userId,
        event: 'FIRST_CATCH',
        speciesId: dto.speciesId,
      });
    }

    return { log: savedLog, xpAwarded, isFirstCatch };
  }
}
