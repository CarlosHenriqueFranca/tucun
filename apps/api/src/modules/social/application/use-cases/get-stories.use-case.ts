import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { StoryOrmEntity } from '../../infrastructure/persistence/story.orm-entity';
import { FollowOrmEntity } from '../../infrastructure/persistence/follow.orm-entity';

@Injectable()
export class GetStoriesUseCase {
  constructor(
    @InjectRepository(StoryOrmEntity)
    private readonly storyRepository: Repository<StoryOrmEntity>,
    @InjectRepository(FollowOrmEntity)
    private readonly followRepository: Repository<FollowOrmEntity>,
  ) {}

  async execute(userId: string): Promise<StoryOrmEntity[]> {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
      select: ['followingId'],
    });

    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return [];
    }

    return this.storyRepository.find({
      where: {
        userId: In(followingIds),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }
}
