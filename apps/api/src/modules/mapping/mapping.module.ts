import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FishingSpotOrmEntity } from './infrastructure/persistence/fishing-spot.orm-entity';
import { SpotChecklistOrmEntity } from './infrastructure/persistence/spot-checklist.orm-entity';
import { SpotRatingOrmEntity } from './infrastructure/persistence/spot-rating.orm-entity';
import { RouteAlertOrmEntity } from './infrastructure/persistence/route-alert.orm-entity';
import { FishLogOrmEntity } from './infrastructure/persistence/fish-log.orm-entity';
import { CreateSpotUseCase } from './application/use-cases/create-spot.use-case';
import { GetNearbySpotsUseCase } from './application/use-cases/get-nearby-spots.use-case';
import { GetSpotUseCase } from './application/use-cases/get-spot.use-case';
import { RateSpotUseCase } from './application/use-cases/rate-spot.use-case';
import { CreateAlertUseCase } from './application/use-cases/create-alert.use-case';
import { GetNearbyAlertsUseCase } from './application/use-cases/get-nearby-alerts.use-case';
import { CreateFishLogUseCase } from './application/use-cases/create-fish-log.use-case';
import { SpotsController } from './presentation/controllers/spots.controller';
import { AlertsController } from './presentation/controllers/alerts.controller';
import { FishLogController } from './presentation/controllers/fish-log.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FishingSpotOrmEntity,
      SpotChecklistOrmEntity,
      SpotRatingOrmEntity,
      RouteAlertOrmEntity,
      FishLogOrmEntity,
    ]),
  ],
  controllers: [SpotsController, AlertsController, FishLogController],
  providers: [
    CreateSpotUseCase,
    GetNearbySpotsUseCase,
    GetSpotUseCase,
    RateSpotUseCase,
    CreateAlertUseCase,
    GetNearbyAlertsUseCase,
    CreateFishLogUseCase,
  ],
  exports: [GetNearbySpotsUseCase, GetNearbyAlertsUseCase],
})
export class MappingModule {}
