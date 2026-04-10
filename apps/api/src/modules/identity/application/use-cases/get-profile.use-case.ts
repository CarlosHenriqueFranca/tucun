import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

export interface GetProfileInput {
  userId?: string;
  username?: string;
  requesterId?: string; // The authenticated user making the request (for private fields)
}

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: GetProfileInput): Promise<Partial<UserEntity>> {
    let user: UserEntity | null = null;

    if (input.userId) {
      user = await this.userRepository.findById(input.userId);
    } else if (input.username) {
      user = await this.userRepository.findByUsername(input.username);
    }

    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    // Full profile for own account
    if (input.requesterId && input.requesterId === user.id) {
      return this.toFullProfile(user);
    }

    // Public profile for others
    return user.toPublicProfile();
  }

  private toFullProfile(user: UserEntity): Partial<UserEntity> {
    return {
      id: user.id,
      email: user.email,
      whatsapp: user.whatsapp,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      city: user.city,
      state: user.state,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      trialUsedAt: user.trialUsedAt,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
      xpTotal: user.xpTotal,
      level: user.level,
      providersLinked: user.providersLinked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
