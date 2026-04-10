import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FishSpeciesOrmEntity } from './infrastructure/persistence/fish-species.orm-entity';
import { PiracemaPeriodOrmEntity } from './infrastructure/persistence/piracema-period.orm-entity';
import { EcoReportOrmEntity } from './infrastructure/persistence/eco-report.orm-entity';
import { GetFishSpeciesUseCase } from './application/use-cases/get-fish-species.use-case';
import { GetFishSpeciesDetailUseCase } from './application/use-cases/get-fish-species-detail.use-case';
import { GetPiracemaStatusUseCase } from './application/use-cases/get-piracema-status.use-case';
import { CreateEcoReportUseCase } from './application/use-cases/create-eco-report.use-case';
import { SustainabilityController } from './presentation/controllers/sustainability.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FishSpeciesOrmEntity,
      PiracemaPeriodOrmEntity,
      EcoReportOrmEntity,
    ]),
  ],
  controllers: [SustainabilityController],
  providers: [
    GetFishSpeciesUseCase,
    GetFishSpeciesDetailUseCase,
    GetPiracemaStatusUseCase,
    CreateEcoReportUseCase,
  ],
  exports: [GetFishSpeciesDetailUseCase],
})
export class SustainabilityModule {}
