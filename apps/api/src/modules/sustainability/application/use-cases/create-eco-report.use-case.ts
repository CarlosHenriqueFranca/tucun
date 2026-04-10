import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EcoReportOrmEntity,
  EcoReportType,
  EcoReportStatus,
} from '../../infrastructure/persistence/eco-report.orm-entity';

export interface CreateEcoReportInput {
  userId: string;
  type: EcoReportType;
  description: string;
  latitude: number;
  longitude: number;
  mediaUrls?: string[];
}

@Injectable()
export class CreateEcoReportUseCase {
  constructor(
    @InjectRepository(EcoReportOrmEntity)
    private readonly ecoReportRepo: Repository<EcoReportOrmEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: CreateEcoReportInput): Promise<EcoReportOrmEntity> {
    const report = this.ecoReportRepo.create({
      userId: input.userId,
      type: input.type,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      mediaUrls: input.mediaUrls ?? [],
      status: EcoReportStatus.PENDING,
    });

    const saved = await this.ecoReportRepo.save(report);

    // Award 25 XP for submitting an eco report
    this.eventEmitter.emit('gamification.xp.award', {
      userId: input.userId,
      amount: 25,
      reason: 'ECO_REPORT_SUBMITTED',
      referenceId: saved.id,
    });

    return saved;
  }
}
