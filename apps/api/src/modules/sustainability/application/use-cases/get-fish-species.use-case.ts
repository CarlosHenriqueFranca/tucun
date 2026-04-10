import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  FishSpeciesOrmEntity,
  ConservationStatus,
} from '../../infrastructure/persistence/fish-species.orm-entity';

export interface GetFishSpeciesInput {
  name?: string;
  conservationStatus?: ConservationStatus;
  isProtectedInRondonia?: boolean;
  isEndemic?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedFishSpecies {
  items: FishSpeciesOrmEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetFishSpeciesUseCase {
  constructor(
    @InjectRepository(FishSpeciesOrmEntity)
    private readonly fishSpeciesRepo: Repository<FishSpeciesOrmEntity>,
  ) {}

  async execute(input: GetFishSpeciesInput): Promise<PaginatedFishSpecies> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (input.name) {
      where.name = ILike(`%${input.name}%`);
    }
    if (input.conservationStatus) {
      where.conservationStatus = input.conservationStatus;
    }
    if (input.isProtectedInRondonia !== undefined) {
      where.isProtectedInRondonia = input.isProtectedInRondonia;
    }
    if (input.isEndemic !== undefined) {
      where.isEndemic = input.isEndemic;
    }

    const [items, total] = await this.fishSpeciesRepo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip,
      take: limit,
    });

    return { items, total, page, limit };
  }
}
