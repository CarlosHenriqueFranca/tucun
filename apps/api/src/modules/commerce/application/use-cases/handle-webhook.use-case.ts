import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SubscriptionOrmEntity } from '../../infrastructure/persistence/subscription.orm-entity';
import { PaymentOrmEntity } from '../../infrastructure/persistence/payment.orm-entity';
import { AsaasWebhookDto } from '../dtos/asaas-webhook.dto';

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptionRepository: Repository<SubscriptionOrmEntity>,
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  validateToken(token: string): void {
    const expectedToken = this.configService.get<string>('ASAAS_WEBHOOK_TOKEN', '');
    if (!expectedToken || token !== expectedToken) {
      throw new UnauthorizedException('Invalid webhook token');
    }
  }

  async execute(dto: AsaasWebhookDto): Promise<void> {
    this.logger.log(`Processing Asaas webhook event: ${dto.event}`);

    switch (dto.event) {
      case 'PAYMENT_CONFIRMED':
        await this.handlePaymentConfirmed(dto);
        break;
      case 'PAYMENT_OVERDUE':
        this.logger.warn(`Payment overdue: ${dto.payment.id}`);
        break;
      case 'SUBSCRIPTION_CANCELLED':
        await this.handleSubscriptionCancelled(dto);
        break;
      default:
        this.logger.debug(`Unhandled webhook event: ${dto.event}`);
    }
  }

  private async handlePaymentConfirmed(dto: AsaasWebhookDto): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { asaasPaymentId: dto.payment.id },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for Asaas ID: ${dto.payment.id}`);
      return;
    }

    await this.paymentRepository.update(payment.id, {
      status: 'confirmed',
      paidAt: new Date(),
    });

    if (payment.subscriptionId) {
      await this.subscriptionRepository.update(payment.subscriptionId, {
        status: 'active',
      });

      const subscription = await this.subscriptionRepository.findOne({
        where: { id: payment.subscriptionId },
      });

      if (subscription) {
        try {
          await this.dataSource.query(
            "UPDATE users SET subscription_tier = 'premium' WHERE id = $1",
            [subscription.userId],
          );
        } catch (error) {
          this.logger.error('Failed to update user subscription tier', error);
        }
      }
    }
  }

  private async handleSubscriptionCancelled(dto: AsaasWebhookDto): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { asaasPaymentId: dto.payment.id },
    });

    if (!payment?.subscriptionId) {
      this.logger.warn(`Subscription not found for payment: ${dto.payment.id}`);
      return;
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { id: payment.subscriptionId },
    });

    if (!subscription) return;

    await this.subscriptionRepository.update(subscription.id, {
      status: 'cancelled',
      cancelledAt: new Date(),
    });

    try {
      await this.dataSource.query(
        "UPDATE users SET subscription_tier = 'free' WHERE id = $1",
        [subscription.userId],
      );
    } catch (error) {
      this.logger.error('Failed to revert user subscription tier', error);
    }
  }
}
