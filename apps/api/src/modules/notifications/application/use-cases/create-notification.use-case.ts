import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationOrmEntity,
  NotificationType,
} from '../../infrastructure/persistence/notification.orm-entity';
import { FirebaseService, PushPayload } from '../../infrastructure/services/firebase.service';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sendPush?: boolean;
}

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly notificationRepo: Repository<NotificationOrmEntity>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(input: CreateNotificationInput): Promise<NotificationOrmEntity> {
    const notification = this.notificationRepo.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data ?? null,
      isRead: false,
    });

    const saved = await this.notificationRepo.save(notification);

    if (input.sendPush !== false) {
      const pushPayload: PushPayload = {
        title: input.title,
        body: input.body,
        data: input.data
          ? Object.fromEntries(
              Object.entries(input.data).map(([k, v]) => [k, String(v)]),
            )
          : undefined,
      };
      // Fire and forget — do not block response
      this.firebaseService.sendToUser(input.userId, pushPayload).catch(() => {});
    }

    return saved;
  }
}
