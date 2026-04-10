import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  appUrl: string;
  apiUrl: string;
  maxFileSizeMb: number;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3333', 10),
    apiPrefix: process.env.API_PREFIX || 'api',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:3333',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '100', 10),
  }),
);
