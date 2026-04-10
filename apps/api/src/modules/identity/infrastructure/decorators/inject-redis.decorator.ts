import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../../../../shared/modules/redis.module';

export { REDIS_CLIENT };

export const InjectRedis = () => Inject(REDIS_CLIENT);
