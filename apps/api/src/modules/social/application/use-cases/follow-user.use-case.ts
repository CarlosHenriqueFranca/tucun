import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowOrmEntity } from '../../infrastructure/persistence/follow.orm-entity';

@Injectable()
export class FollowUserUseCase {
  constructor(
    @InjectRepository(FollowOrmEntity)
    private readonly followRepository: Repository<FollowOrmEntity>,
  ) {}

  async execute(followerId: string, followingId: string): Promise<FollowOrmEntity> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existing) {
      throw new ConflictException('Already following this user');
    }

    const follow = this.followRepository.create({ followerId, followingId });
    return this.followRepository.save(follow);
  }
}
