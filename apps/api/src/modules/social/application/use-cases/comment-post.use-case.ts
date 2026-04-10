import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostOrmEntity } from '../../infrastructure/persistence/post.orm-entity';
import { PostCommentOrmEntity } from '../../infrastructure/persistence/post-comment.orm-entity';
import { CreateCommentDto } from '../dtos/create-comment.dto';

@Injectable()
export class CommentPostUseCase {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postRepository: Repository<PostOrmEntity>,
    @InjectRepository(PostCommentOrmEntity)
    private readonly commentRepository: Repository<PostCommentOrmEntity>,
  ) {}

  async execute(
    postId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<PostCommentOrmEntity> {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException(`Post ${postId} not found`);
    }

    const comment = this.commentRepository.create({
      postId,
      userId,
      content: dto.content,
      parentId: dto.parentId ?? null,
    });

    const saved = await this.commentRepository.save(comment);

    await this.postRepository.increment({ id: postId }, 'commentsCount', 1);

    return saved;
  }
}
