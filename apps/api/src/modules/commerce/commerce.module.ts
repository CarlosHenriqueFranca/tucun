import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionOrmEntity } from './infrastructure/persistence/subscription.orm-entity';
import { PaymentOrmEntity } from './infrastructure/persistence/payment.orm-entity';
import { AsaasService } from './infrastructure/services/asaas.service';
import { StartTrialUseCase } from './application/use-cases/start-trial.use-case';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.use-case';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';
import { CommerceController } from './presentation/controllers/commerce.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionOrmEntity, PaymentOrmEntity]),
  ],
  controllers: [CommerceController],
  providers: [
    AsaasService,
    StartTrialUseCase,
    CreateSubscriptionUseCase,
    HandleWebhookUseCase,
  ],
  exports: [StartTrialUseCase, AsaasService],
})
export class CommerceModule {}
