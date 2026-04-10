import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteAlertOrmEntity } from '../../infrastructure/persistence/route-alert.orm-entity';
import { CreateAlertDto } from '../dtos/create-alert.dto';

@Injectable()
export class CreateAlertUseCase {
  constructor(
    @InjectRepository(RouteAlertOrmEntity)
    private readonly alertRepository: Repository<RouteAlertOrmEntity>,
  ) {}

  async execute(dto: CreateAlertDto, reportedById: string): Promise<RouteAlertOrmEntity> {
    const alert = this.alertRepository.create({
      ...dto,
      reportedById,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isVerified: false,
      isActive: true,
      upvotes: 0,
      downvotes: 0,
    });

    return this.alertRepository.save(alert);
  }
}
