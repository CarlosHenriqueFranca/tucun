import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FishingSpotOrmEntity } from '../../infrastructure/persistence/fishing-spot.orm-entity';
import { SpotRatingOrmEntity } from '../../infrastructure/persistence/spot-rating.orm-entity';
import { RateSpotDto } from '../dtos/rate-spot.dto';

@Injectable()
export class RateSpotUseCase {
  constructor(
    @InjectRepository(FishingSpotOrmEntity)
    private readonly spotRepository: Repository<FishingSpotOrmEntity>,
    @InjectRepository(SpotRatingOrmEntity)
    private readonly ratingRepository: Repository<SpotRatingOrmEntity>,
  ) {}

  async execute(spotId: string, userId: string, dto: RateSpotDto): Promise<SpotRatingOrmEntity> {
    const spot = await this.spotRepository.findOne({ where: { id: spotId, isActive: true } });

    if (!spot) {
      throw new NotFoundException(`Spot with id ${spotId} not found`);
    }

    let rating = await this.ratingRepository.findOne({ where: { spotId, userId } });

    if (rating) {
      rating.rating = dto.rating;
      rating.comment = dto.comment ?? null;
    } else {
      rating = this.ratingRepository.create({
        spotId,
        userId,
        rating: dto.rating,
      });
      if (dto.comment !== undefined) {
        rating.comment = dto.comment ?? null;
      }
    }

    const savedRating = await this.ratingRepository.save(rating);

    // Recalculate average and total
    const raw = await this.ratingRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.spotId = :spotId', { spotId })
      .getRawOne<{ avg: string; count: string }>();

    const avg = raw?.avg ?? '0';
    const count = raw?.count ?? '0';

    await this.spotRepository.update(spotId, {
      averageRating: parseFloat(parseFloat(avg).toFixed(2)),
      totalRatings: parseInt(count, 10),
    });

    return savedRating;
  }
}
