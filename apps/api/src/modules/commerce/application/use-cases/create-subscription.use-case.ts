import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SubscriptionOrmEntity } from '../../infrastructure/persistence/subscription.orm-entity';
import { PaymentOrmEntity } from '../../infrastructure/persistence/payment.orm-entity';
import { AsaasService } from '../../infrastructure/services/asaas.service';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';

export interface CreateSubscriptionResult {
  subscription: SubscriptionOrmEntity;
  payment: PaymentOrmEntity;
  pixQrCode?: string;
  pixCopyPaste?: string;
  invoiceUrl?: string;
}

@Injectable()
export class CreateSubscriptionUseCase {
  private readonly logger = new Logger(CreateSubscriptionUseCase.name);

  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptionRepository: Repository<SubscriptionOrmEntity>,
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly asaasService: AsaasService,
  ) {}

  async execute(
    userId: string,
    dto: CreateSubscriptionDto,
    userInfo: { name: string; email: string; cpfCnpj?: string; phone?: string },
  ): Promise<CreateSubscriptionResult> {
    // Find or create Asaas customer
    let customer = await this.asaasService.findCustomerByEmail(userInfo.email);
    if (!customer) {
      customer = await this.asaasService.createCustomer({
        name: userInfo.name,
        email: userInfo.email,
        cpfCnpj: userInfo.cpfCnpj,
        phone: userInfo.phone,
      });
    }

    const asaasBillingType =
      dto.paymentMethod === 'pix' ? 'PIX' : 'CREDIT_CARD';

    const planValues: Record<string, number> = {
      monthly: 59.9,
      annual: dto.installments === 10 ? 49.9 : 497.0,
    };

    const value = planValues[dto.plan];
    const description = `Tucun Premium - Plano ${dto.plan === 'monthly' ? 'Mensal' : 'Anual'}`;

    // Create Asaas payment
    const paymentResult = await this.asaasService.createPayment(
      customer.id,
      value,
      asaasBillingType as 'PIX' | 'CREDIT_CARD' | 'APPLE_PAY',
      description,
    );

    const startDate = new Date();
    const endDate = new Date();
    if (dto.plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create local subscription
    const subscription = this.subscriptionRepository.create({
      userId,
      plan: dto.plan,
      status: 'active',
      asaasId: paymentResult.payment.id,
      startDate,
      endDate,
      cancelledAt: null,
    });
    const savedSubscription = await this.subscriptionRepository.save(subscription);

    const asaasPaymentMethod = dto.paymentMethod as 'pix' | 'credit_card';

    // Record payment
    const payment = this.paymentRepository.create({
      userId,
      subscriptionId: savedSubscription.id,
      asaasPaymentId: paymentResult.payment.id,
      amount: value,
      currency: 'BRL',
      paymentMethod: asaasPaymentMethod,
      status: 'pending',
      paidAt: null,
    });
    const savedPayment = await this.paymentRepository.save(payment);

    // Update user subscription tier
    try {
      await this.dataSource.query(
        "UPDATE users SET subscription_tier = 'premium' WHERE id = $1",
        [userId],
      );
    } catch (error) {
      this.logger.warn(`Could not update subscription_tier for user ${userId}`, error);
    }

    return {
      subscription: savedSubscription,
      payment: savedPayment,
      pixQrCode: paymentResult.pixQrCode,
      pixCopyPaste: paymentResult.pixCopyPaste,
      invoiceUrl: paymentResult.invoiceUrl,
    };
  }
}
