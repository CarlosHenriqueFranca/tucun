import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowOrmEntity } from '../../infrastructure/persistence/follow.orm-entity';

@Injectable()
export class UnfollowUserUseCase {
  constructor(
    @InjectRepository(FollowOrmEntity)
    private readonly followRepository: Repository<FollowOrmEntity>,
  ) {}

  async execute(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followRepository.remove(follow);
  }
}
