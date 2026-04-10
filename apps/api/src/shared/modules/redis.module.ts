import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

const logger = new Logger('RedisModule');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (config: ConfigService): Promise<Redis> => {
        const password = config.get<string>('REDIS_PASSWORD', 'tucun_redis_dev');
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);

        const redis = new Redis({
          host,
          port,
          password,
          // Don't give up on retries during development
          retryStrategy: (times: number) => {
            logger.warn(`Redis retry attempt ${times}`);
            return Math.min(times * 200, 5000); // always retry
          },
          lazyConnect: false,
          enableReadyCheck: true,
          maxRetriesPerRequest: null, // no limit per command
          connectTimeout: 10000,
        });

        // Wait for the connection to be ready before returning
        await new Promise<void>((resolve) => {
          if (redis.status === 'ready') {
            resolve();
            return;
          }

          const onReady = () => {
            logger.log('[Redis] Connected and ready!');
            resolve();
          };

          const onError = (err: Error) => {
            logger.error('[Redis] Connection error:', err.message);
            // Don't reject - just log the error, let retryStrategy handle reconnection
          };

          redis.once('ready', onReady);
          redis.on('error', onError);

          // Timeout fallback - don't block startup forever
          setTimeout(() => {
            resolve();
          }, 8000);
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
