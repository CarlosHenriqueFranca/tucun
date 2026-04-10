import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostOrmEntity } from '../../infrastructure/persistence/post.orm-entity';
import { PostLikeOrmEntity } from '../../infrastructure/persistence/post-like.orm-entity';

export interface LikeResult {
  liked: boolean;
  likesCount: number;
}

@Injectable()
export class LikePostUseCase {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postRepository: Repository<PostOrmEntity>,
    @InjectRepository(PostLikeOrmEntity)
    private readonly likeRepository: Repository<PostLikeOrmEntity>,
  ) {}

  async execute(postId: string, userId: string): Promise<LikeResult> {
    const existingLike = await this.likeRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      await this.postRepository.decrement({ id: postId }, 'likesCount', 1);

      const post = await this.postRepository.findOneOrFail({ where: { id: postId } });
      return { liked: false, likesCount: post.likesCount };
    }

    const like = this.likeRepository.create({ postId, userId });
    await this.likeRepository.save(like);
    await this.postRepository.increment({ id: postId }, 'likesCount', 1);

    const post = await this.postRepository.findOneOrFail({ where: { id: postId } });
    return { liked: true, likesCount: post.likesCount };
  }
}
