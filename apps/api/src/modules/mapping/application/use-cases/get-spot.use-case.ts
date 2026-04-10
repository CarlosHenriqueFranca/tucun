import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FishingSpotOrmEntity } from '../../infrastructure/persistence/fishing-spot.orm-entity';
import { SpotChecklistOrmEntity } from '../../infrastructure/persistence/spot-checklist.orm-entity';
import { SpotRatingOrmEntity } from '../../infrastructure/persistence/spot-rating.orm-entity';

export interface SpotDetail {
  spot: FishingSpotOrmEntity;
  checklist: SpotChecklistOrmEntity[];
  ratings: SpotRatingOrmEntity[];
}

@Injectable()
export class GetSpotUseCase {
  constructor(
    @InjectRepository(FishingSpotOrmEntity)
    private readonly spotRepository: Repository<FishingSpotOrmEntity>,
    @InjectRepository(SpotChecklistOrmEntity)
    private readonly checklistRepository: Repository<SpotChecklistOrmEntity>,
    @InjectRepository(SpotRatingOrmEntity)
    private readonly ratingRepository: Repository<SpotRatingOrmEntity>,
  ) {}

  async execute(id: string): Promise<SpotDetail> {
    const spot = await this.spotRepository.findOne({ where: { id, isActive: true } });

    if (!spot) {
      throw new NotFoundException(`Spot with id ${id} not found`);
    }

    const [checklist, ratings] = await Promise.all([
      this.checklistRepository.find({ where: { spotId: id } }),
      this.ratingRepository.find({ where: { spotId: id }, order: { createdAt: 'DESC' }, take: 10 }),
    ]);

    return { spot, checklist, ratings };
  }
}
