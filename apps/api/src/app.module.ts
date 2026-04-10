import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
import { RedisModule } from './shared/modules/redis.module';
import { SnakeCaseNamingStrategy } from './shared/utils/snake-case-naming.strategy';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';

// Feature Modules
import { IdentityModule } from './modules/identity/identity.module';
import { MappingModule } from './modules/mapping/mapping.module';
import { SocialModule } from './modules/social/social.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { CommerceModule } from './modules/commerce/commerce.module';
import { CommunityModule } from './modules/community/community.module';
import { SustainabilityModule } from './modules/sustainability/sustainability.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // ── Config ─────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '../../../..', '.env'),
        join(process.cwd(), '.env'),
        '.env',
      ],
      load: [appConfig, databaseConfig, jwtConfig, redisConfig],
      expandVariables: true,
    }),

    // ── Redis ─────────────────────────────────────────────────────────
    RedisModule,

    // ── Database (TypeORM + PostgreSQL + PostGIS) ────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [join(__dirname, '**/*.orm-entity{.ts,.js}')],
        migrations: [join(__dirname, 'database/migrations/*{.ts,.js}')],
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
        namingStrategy: new SnakeCaseNamingStrategy(),
        ssl:
          config.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        extra: {
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
      inject: [ConfigService],
    }),

    // ── Rate Limiting ────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('RATE_LIMIT_TTL', 60000),
          limit: config.get<number>('RATE_LIMIT_REQUESTS', 100),
        },
      ],
      inject: [ConfigService],
    }),

    // ── Event Emitter ────────────────────────────────────────────────
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // ── Feature Modules ───────────────────────────────────────────────
    IdentityModule,
    MappingModule,
    SocialModule,
    MessagingModule,
    GamificationModule,
    CommerceModule,
    CommunityModule,
    SustainabilityModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
