import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// ORM Entities
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';

// Repository
import { UserRepository } from './infrastructure/persistence/user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

// Strategies
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { FacebookStrategy } from './infrastructure/strategies/facebook.strategy';

// Services
import { TokenService } from './application/services/token.service';
import { ZApiService } from './application/services/zapi.service';

// Use Cases
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { SendOtpUseCase } from './application/use-cases/send-otp.use-case';
import { VerifyOtpUseCase } from './application/use-cases/verify-otp.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';
import { UsersController } from './presentation/controllers/users.controller';

// Guards
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
        return {
          secret: config.get<string>(
            'JWT_ACCESS_SECRET',
            'tucun_access_secret_change_in_prod',
          ),
          signOptions: {
            expiresIn: expiresIn as unknown as number,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    // Repository
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    // Strategies
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
    // Services
    TokenService,
    ZApiService,
    // Use Cases
    RegisterUserUseCase,
    LoginUseCase,
    SendOtpUseCase,
    VerifyOtpUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
    // Guards
    JwtAuthGuard,
  ],
  exports: [
    JwtModule,
    PassportModule,
    TokenService,
    USER_REPOSITORY,
    GetProfileUseCase,
    JwtAuthGuard,
  ],
})
export class IdentityModule {}
