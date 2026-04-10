import { registerAs } from '@nestjs/config';

export interface RedisConfig {
  url: string;
  host: string;
  port: number;
  password: string | undefined;
  db: number;
}

export default registerAs(
  'redis',
  (): RedisConfig => {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const parsed = new URL(redisUrl);

    return {
      url: redisUrl,
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port || '6379', 10),
      password: process.env.REDIS_PASSWORD || parsed.password || undefined,
      db: parseInt(parsed.pathname?.replace('/', '') || '0', 10),
    };
  },
);
