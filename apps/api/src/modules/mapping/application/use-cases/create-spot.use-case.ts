import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FishingSpotOrmEntity } from '../../infrastructure/persistence/fishing-spot.orm-entity';
import { CreateSpotDto } from '../dtos/create-spot.dto';

@Injectable()
export class CreateSpotUseCase {
  constructor(
    @InjectRepository(FishingSpotOrmEntity)
    private readonly spotRepository: Repository<FishingSpotOrmEntity>,
  ) {}

  async execute(dto: CreateSpotDto, createdById: string): Promise<FishingSpotOrmEntity> {
    const spot = this.spotRepository.create({
      ...dto,
      createdById,
      isVerified: false,
      isActive: true,
      averageRating: 0,
      totalRatings: 0,
      totalCheckins: 0,
    });

    return this.spotRepository.save(spot);
  }
}
