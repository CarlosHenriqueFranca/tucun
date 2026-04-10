import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationOrmEntity } from '../../infrastructure/persistence/notification.orm-entity';

export interface GetNotificationsInput {
  userId: string;
  page?: number;
  limit?: number;
}

export interface PaginatedNotifications {
  items: NotificationOrmEntity[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly notificationRepo: Repository<NotificationOrmEntity>,
  ) {}

  async execute(input: GetNotificationsInput): Promise<PaginatedNotifications> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.notificationRepo.findAndCount({
      where: { userId: input.userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const unreadCount = await this.notificationRepo.count({
      where: { userId: input.userId, isRead: false },
    });

    return { items, total, unreadCount, page, limit };
  }
}
