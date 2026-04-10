import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostOrmEntity } from '../../infrastructure/persistence/post.orm-entity';
import { CreatePostDto } from '../dtos/create-post.dto';

export class XpAwardEvent {
  constructor(
    public readonly userId: string,
    public readonly eventType: string,
    public readonly xpAmount: number,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}

@Injectable()
export class CreatePostUseCase {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly postRepository: Repository<PostOrmEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreatePostDto, userId: string): Promise<PostOrmEntity> {
    const hasVideo = dto.mediaTypes.includes('video');

    const post = this.postRepository.create({
      ...dto,
      userId,
      caption: dto.caption ?? null,
      spotId: dto.spotId ?? null,
      fishSpeciesId: dto.fishSpeciesId ?? null,
      isPublic: dto.isPublic ?? true,
    });

    const saved = await this.postRepository.save(post);

    // Emit XP event: 20 XP for video, 10 XP for photo
    const xpAmount = hasVideo ? 20 : 10;
    const eventType = hasVideo ? 'POST_VIDEO' : 'POST_PHOTO';

    this.eventEmitter.emit(
      'xp.award',
      new XpAwardEvent(userId, eventType, xpAmount, { postId: saved.id }),
    );

    return saved;
  }
}
