import {
  Injectable,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterDto } from '../dtos/register.dto';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { TokenService, TokenPair } from '../services/token.service';
import { ZApiService } from '../services/zapi.service';

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    subscriptionTier: string;
    trialUsedAt: Date | null;
  };
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly zapiService: ZApiService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: RegisterDto): Promise<RegisterResponse> {
    const email = dto.email.trim().toLowerCase();

    // Check email uniqueness
    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new ConflictException('Email already registered');
    }

    // Check whatsapp uniqueness if provided
    if (dto.whatsapp) {
      const whatsappExists = await this.userRepository.existsByWhatsapp(dto.whatsapp);
      if (whatsappExists) {
        throw new ConflictException('WhatsApp number already registered');
      }
    }

    // Generate username if not provided
    let username = dto.username?.toLowerCase().trim();
    if (!username) {
      username = await this.generateUniqueUsername(email.split('@')[0]);
    } else {
      const usernameExists = await this.userRepository.existsByUsername(username);
      if (usernameExists) {
        throw new ConflictException('Username already taken');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create domain entity
    const user = new UserEntity({
      id: uuidv4(),
      email,
      passwordHash,
      whatsapp: dto.whatsapp,
      name: dto.name,
      username,
      providersLinked: ['local'],
    });

    // Start 7-day trial
    user.startTrial();

    // Persist
    const savedUser = await this.userRepository.create(user);

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair({
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      subscriptionTier: savedUser.subscriptionTier,
      trialUsedAt: savedUser.trialUsedAt?.toISOString() ?? null,
    });

    // Store refresh token
    await this.tokenService.storeRefreshToken(savedUser.id, tokens.refreshToken);

    // Emit domain event (non-blocking)
    this.eventEmitter.emit(
      UserRegisteredEvent.EVENT_NAME,
      new UserRegisteredEvent(
        savedUser.id,
        savedUser.email,
        savedUser.name,
        savedUser.whatsapp,
        'email',
      ),
    );

    // Send welcome WhatsApp message if whatsapp provided (non-blocking)
    if (savedUser.whatsapp) {
      this.zapiService
        .sendWelcomeMessage(savedUser.whatsapp, savedUser.name)
        .catch(() => null);
    }

    return {
      ...tokens,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        username: savedUser.username,
        subscriptionTier: savedUser.subscriptionTier,
        trialUsedAt: savedUser.trialUsedAt,
      },
    };
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    // Sanitize: keep alphanumeric + underscore, lowercase
    let candidate = base.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

    // Enforce min/max length
    if (candidate.length < 3) candidate = candidate.padEnd(3, '_');
    if (candidate.length > 25) candidate = candidate.substring(0, 25);

    const exists = await this.userRepository.existsByUsername(candidate);
    if (!exists) return candidate;

    // Append random suffix
    for (let i = 0; i < 10; i++) {
      const suffix = Math.floor(Math.random() * 9999);
      const withSuffix = `${candidate}_${suffix}`;
      const suffixExists = await this.userRepository.existsByUsername(withSuffix);
      if (!suffixExists) return withSuffix;
    }

    // Fallback: uuid-based username
    return `user_${uuidv4().replace(/-/g, '').substring(0, 10)}`;
  }
}
