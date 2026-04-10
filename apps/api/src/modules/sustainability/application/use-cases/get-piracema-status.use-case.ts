import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { PiracemaPeriodOrmEntity } from '../../infrastructure/persistence/piracema-period.orm-entity';

export interface PiracemaStatus {
  isActive: boolean;
  period: PiracemaPeriodOrmEntity | null;
  regulations: string | null;
  daysUntilEnd: number | null;
  daysUntilStart: number | null;
}

export interface PiracemaCalendarEntry {
  year: number;
  startDate: string;
  endDate: string;
  state: string;
  regulations: string;
  isActive: boolean;
}

@Injectable()
export class GetPiracemaStatusUseCase {
  constructor(
    @InjectRepository(PiracemaPeriodOrmEntity)
    private readonly piracemaRepo: Repository<PiracemaPeriodOrmEntity>,
  ) {}

  async getCurrentStatus(): Promise<PiracemaStatus> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Check if today falls within an active piracema period
    const activePeriod = await this.piracemaRepo
      .createQueryBuilder('p')
      .where('p.isActive = true')
      .andWhere('p.startDate <= :today', { today: todayStr })
      .andWhere('p.endDate >= :today', { today: todayStr })
      .orderBy('p.year', 'DESC')
      .getOne();

    if (activePeriod) {
      const endDate = new Date(activePeriod.endDate);
      const msUntilEnd = endDate.getTime() - today.getTime();
      const daysUntilEnd = Math.ceil(msUntilEnd / (1000 * 60 * 60 * 24));

      return {
        isActive: true,
        period: activePeriod,
        regulations: activePeriod.regulations,
        daysUntilEnd: Math.max(0, daysUntilEnd),
        daysUntilStart: null,
      };
    }

    // Find next upcoming period
    const nextPeriod = await this.piracemaRepo
      .createQueryBuilder('p')
      .where('p.isActive = true')
      .andWhere('p.startDate > :today', { today: todayStr })
      .orderBy('p.startDate', 'ASC')
      .getOne();

    if (nextPeriod) {
      const startDate = new Date(nextPeriod.startDate);
      const msUntilStart = startDate.getTime() - today.getTime();
      const daysUntilStart = Math.ceil(msUntilStart / (1000 * 60 * 60 * 24));

      return {
        isActive: false,
        period: nextPeriod,
        regulations: nextPeriod.regulations,
        daysUntilEnd: null,
        daysUntilStart: Math.max(0, daysUntilStart),
      };
    }

    // No period found — compute from default RO schedule (Nov 1 - Mar 1)
    const year = today.getFullYear();
    const novFirst = new Date(`${year}-11-01`);
    const marFirst = new Date(`${year + 1}-03-01`);

    const isInDefaultPeriod = today >= novFirst || today < marFirst;

    if (isInDefaultPeriod) {
      const daysUntilEnd = Math.ceil(
        (marFirst.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        isActive: true,
        period: null,
        regulations: 'Piracema em Rondônia: proibido pesca de 01/11 a 01/03.',
        daysUntilEnd: Math.max(0, daysUntilEnd),
        daysUntilStart: null,
      };
    }

    const daysUntilStart = Math.ceil(
      (novFirst.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      isActive: false,
      period: null,
      regulations: 'Piracema em Rondônia: proibido pesca de 01/11 a 01/03.',
      daysUntilEnd: null,
      daysUntilStart: Math.max(0, daysUntilStart),
    };
  }

  async getAnnualCalendar(): Promise<PiracemaCalendarEntry[]> {
    const periods = await this.piracemaRepo.find({
      order: { year: 'DESC' },
    });

    return periods.map((p) => ({
      year: p.year,
      startDate: p.startDate,
      endDate: p.endDate,
      state: p.state,
      regulations: p.regulations,
      isActive: p.isActive,
    }));
  }
}
