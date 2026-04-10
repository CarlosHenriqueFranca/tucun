import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

export interface UpdateProfileInput {
  userId: string;
  dto: UpdateProfileDto;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateProfileInput): Promise<UserEntity> {
    const { userId, dto } = input;

    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    // Validate username uniqueness if being changed
    if (dto.username && dto.username.toLowerCase() !== user.username) {
      const usernameExists = await this.userRepository.existsByUsername(
        dto.username.toLowerCase(),
      );
      if (usernameExists) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Apply updates
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.username !== undefined) user.username = dto.username.toLowerCase();
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.city !== undefined) user.city = dto.city;
    if (dto.state !== undefined) user.state = dto.state.toUpperCase();
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;

    user.updatedAt = new Date();

    return this.userRepository.update(user);
  }
}
