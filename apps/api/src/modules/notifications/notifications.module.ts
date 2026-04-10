import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationOrmEntity } from './infrastructure/persistence/notification.orm-entity';
import { PushTokenOrmEntity } from './infrastructure/persistence/push-token.orm-entity';
import { FirebaseService } from './infrastructure/services/firebase.service';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { MarkNotificationsReadUseCase } from './application/use-cases/mark-notifications-read.use-case';
import { NotificationsController } from './presentation/controllers/notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationOrmEntity, PushTokenOrmEntity]),
  ],
  controllers: [NotificationsController],
  providers: [
    FirebaseService,
    CreateNotificationUseCase,
    GetNotificationsUseCase,
    MarkNotificationsReadUseCase,
  ],
  exports: [CreateNotificationUseCase, FirebaseService],
})
export class NotificationsModule {}
