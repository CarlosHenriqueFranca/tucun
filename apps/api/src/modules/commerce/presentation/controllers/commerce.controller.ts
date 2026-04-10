import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { CreateSubscriptionDto } from '../../application/dtos/create-subscription.dto';
import { AsaasWebhookDto } from '../../application/dtos/asaas-webhook.dto';
import { StartTrialUseCase } from '../../application/use-cases/start-trial.use-case';
import { CreateSubscriptionUseCase } from '../../application/use-cases/create-subscription.use-case';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook.use-case';
import { SubscriptionOrmEntity } from '../../infrastructure/persistence/subscription.orm-entity';
import { PaymentOrmEntity } from '../../infrastructure/persistence/payment.orm-entity';
import { AsaasService } from '../../infrastructure/services/asaas.service';

const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    description: '7 dias de teste grátis',
    price: 0,
    currency: 'BRL',
    trial: true,
    trialDays: 7,
    features: [
      'Acesso básico ao mapa',
      'Visualizar pontos de pesca',
      'Feed social limitado',
    ],
  },
  {
    id: 'monthly',
    name: 'Mensal',
    description: 'Acesso completo por mês',
    price: 59.9,
    currency: 'BRL',
    billingCycle: 'monthly',
    features: [
      'Acesso completo ao mapa',
      'Criar pontos de pesca ilimitados',
      'Feed social completo',
      'Sistema de gamificação',
      'Alertas de rota',
      'Suporte prioritário',
    ],
  },
  {
    id: 'annual',
    name: 'Anual',
    description: 'Melhor custo-benefício',
    price: 497,
    currency: 'BRL',
    billingCycle: 'annual',
    installments: {
      count: 10,
      value: 49.9,
    },
    savings: 'Economize R$221/ano em relação ao plano mensal',
    features: [
      'Tudo do plano Mensal',
      'Badge exclusivo de membro anual',
      'Acesso antecipado a novas features',
      'Relatórios avançados de pesca',
    ],
  },
];

@ApiTags('commerce')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class CommerceController {
  constructor(
    private readonly startTrialUseCase: StartTrialUseCase,
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly handleWebhookUseCase: HandleWebhookUseCase,
    private readonly asaasService: AsaasService,
    @InjectRepository(SubscriptionOrmEntity)
    private readonly subscriptionRepository: Repository<SubscriptionOrmEntity>,
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'List available subscription plans with prices' })
  getPlans() {
    return { plans: PLANS };
  }

  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user subscription' })
  async getMySubscription(@CurrentUser() user: CurrentUserPayload) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId: user.sub },
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      return { subscription: null };
    }

    return { subscription };
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new subscription' })
  async createSubscription(
    @Body() dto: CreateSubscriptionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // Fetch user info from DB
    const userResult = await this.dataSource.query<
      { name: string; email: string; phone?: string }[]
    >('SELECT name, email, phone FROM users WHERE id = $1', [user.sub]);

    if (!userResult.length) {
      throw new NotFoundException('User not found');
    }

    const userInfo = userResult[0];

    return this.createSubscriptionUseCase.execute(user.sub, dto, {
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
    });
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Asaas payment webhook (validate token header)' })
  async webhook(
    @Body() dto: AsaasWebhookDto,
    @Headers('asaas-access-token') token: string,
  ) {
    this.handleWebhookUseCase.validateToken(token ?? '');
    await this.handleWebhookUseCase.execute(dto);
    return { received: true };
  }

  @Post('cancel')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel current subscription' })
  async cancel(@CurrentUser() user: CurrentUserPayload) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId: user.sub, status: 'active' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    if (subscription.asaasId) {
      try {
        await this.asaasService.cancelSubscription(subscription.asaasId);
      } catch {
        // Continue even if Asaas cancel fails, update local state
      }
    }

    await this.subscriptionRepository.update(subscription.id, {
      status: 'cancelled',
      cancelledAt: new Date(),
    });

    await this.dataSource.query(
      "UPDATE users SET subscription_tier = 'free' WHERE id = $1",
      [user.sub],
    );

    return { message: 'Subscription cancelled successfully' };
  }

  @Get('payments')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment history' })
  async getPayments(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const skip = (p - 1) * l;
    const [data, total] = await this.paymentRepository.findAndCount({
      where: { userId: user.sub },
      order: { createdAt: 'DESC' },
      skip,
      take: l,
    });
    return { data, total, page: p, limit: l };
  }
}
