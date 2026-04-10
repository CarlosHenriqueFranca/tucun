import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SubscriptionOrmEntity } from '../../infrastructure/persistence/subscription.orm-entity';

@Injectable()
export class StartTrialUseCase {
  private readonly logger = new Logger(StartTrialUseCase.name);

  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptionRepository: Repository<SubscriptionOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(userId: string): Promise<SubscriptionOrmEntity> {
    // Check if user already used trial
    const userResult = await this.dataSource.query<{ trial_used_at: Date | null }[]>(
      'SELECT trial_used_at FROM users WHERE id = $1',
      [userId],
    );

    if (userResult[0]?.trial_used_at) {
      throw new ConflictException('Trial already used');
    }

    const existing = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('User already has a subscription');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const subscription = this.subscriptionRepository.create({
      userId,
      plan: 'monthly',
      status: 'trial',
      startDate,
      endDate,
      asaasId: null,
      cancelledAt: null,
    });

    const saved = await this.subscriptionRepository.save(subscription);

    // Update user trial_used_at
    try {
      await this.dataSource.query(
        'UPDATE users SET trial_used_at = NOW() WHERE id = $1',
        [userId],
      );
    } catch (error) {
      this.logger.warn(`Could not update trial_used_at for user ${userId}`, error);
    }

    return saved;
  }
}
