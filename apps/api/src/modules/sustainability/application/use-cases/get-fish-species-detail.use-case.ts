import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FishSpeciesOrmEntity } from '../../infrastructure/persistence/fish-species.orm-entity';

@Injectable()
export class GetFishSpeciesDetailUseCase {
  constructor(
    @InjectRepository(FishSpeciesOrmEntity)
    private readonly fishSpeciesRepo: Repository<FishSpeciesOrmEntity>,
  ) {}

  async execute(id: string): Promise<FishSpeciesOrmEntity> {
    const species = await this.fishSpeciesRepo.findOne({ where: { id } });

    if (!species) {
      throw new NotFoundException(`Fish species with id "${id}" not found`);
    }

    return species;
  }
}
