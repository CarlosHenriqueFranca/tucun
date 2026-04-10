import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostOrmEntity } from '../../infrastructure/persistence/post.orm-entity';
import { FollowOrmEntity } from '../../infrastructure/persistence/follow.orm-entity';
import { FeedQueryDto } from '../dtos/feed-query.dto';

export interface FeedResult {
  data: PostOrmEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetFeedUseCase {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postRepository: Repository<PostOrmEntity>,
    @InjectRepository(FollowOrmEntity)
    private readonly followRepository: Repository<FollowOrmEntity>,
  ) {}

  async execute(userId: string, query: FeedQueryDto): Promise<FeedResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const type = query.type ?? 'discover';
    const skip = (page - 1) * limit;

    if (type === 'following') {
      const follows = await this.followRepository.find({
        where: { followerId: userId },
        select: ['followingId'],
      });

      const followingIds = follows.map((f) => f.followingId);

      if (followingIds.length === 0) {
        return { data: [], total: 0, page, limit };
      }

      const [data, total] = await this.postRepository
        .createQueryBuilder('p')
        .where('p.userId IN (:...followingIds)', { followingIds })
        .andWhere('p.isPublic = true')
        .orderBy('p.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return { data, total, page, limit };
    }

    // discover: all public posts trending
    const [data, total] = await this.postRepository
      .createQueryBuilder('p')
      .where('p.isPublic = true')
      .orderBy('p.likesCount', 'DESC')
      .addOrderBy('p.viewsCount', 'DESC')
      .addOrderBy('p.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }
}
