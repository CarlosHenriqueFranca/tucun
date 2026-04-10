import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

// HealthModule doesn't need to import RedisModule explicitly because
// RedisModule is @Global() and exports REDIS_CLIENT to all modules.
// TypeOrmModule's DataSource is also globally available.
@Module({
  imports: [
    // Ensure TypeORM's DataSource is available via @InjectDataSource()
    TypeOrmModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
