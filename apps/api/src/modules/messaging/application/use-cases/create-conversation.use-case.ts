import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/conversation.orm-entity';
import { ConversationParticipantOrmEntity } from '../../infrastructure/persistence/conversation-participant.orm-entity';
import { CreateConversationDto } from '../dtos/create-conversation.dto';

@Injectable()
export class CreateConversationUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepo: Repository<ConversationOrmEntity>,
    @InjectRepository(ConversationParticipantOrmEntity)
    private readonly participantRepo: Repository<ConversationParticipantOrmEntity>,
  ) {}

  async execute(
    currentUserId: string,
    dto: CreateConversationDto,
  ): Promise<ConversationOrmEntity> {
    const allParticipantIds = Array.from(
      new Set([currentUserId, ...dto.participantIds]),
    );

    // For DMs (non-group, exactly 2 participants), check if conversation already exists
    if (!dto.isGroup && allParticipantIds.length === 2) {
      const existing = await this.findExistingDm(allParticipantIds);
      if (existing) {
        return this.conversationRepo.findOne({
          where: { id: existing.id },
          relations: ['participants'],
        }) as Promise<ConversationOrmEntity>;
      }
    }

    if (dto.isGroup && allParticipantIds.length < 2) {
      throw new BadRequestException(
        'Group conversations require at least 2 participants',
      );
    }

    const conversation = this.conversationRepo.create({
      name: dto.name ?? null,
      isGroup: dto.isGroup ?? false,
      avatarUrl: null,
      lastMessageAt: null,
    });

    const saved = await this.conversationRepo.save(conversation);

    const participants = allParticipantIds.map((userId, index) =>
      this.participantRepo.create({
        conversationId: saved.id,
        userId,
        lastReadAt: null,
        isAdmin: index === 0, // creator is admin
      }),
    );

    await this.participantRepo.save(participants);

    return this.conversationRepo.findOne({
      where: { id: saved.id },
      relations: ['participants'],
    }) as Promise<ConversationOrmEntity>;
  }

  private async findExistingDm(
    participantIds: string[],
  ): Promise<ConversationOrmEntity | null> {
    const conversations = await this.conversationRepo
      .createQueryBuilder('c')
      .innerJoin('c.participants', 'p')
      .where('c.isGroup = false')
      .andWhere('p.userId IN (:...ids)', { ids: participantIds })
      .groupBy('c.id')
      .having('COUNT(DISTINCT p.userId) = :count', {
        count: participantIds.length,
      })
      .getMany();

    for (const conv of conversations) {
      const participants = await this.participantRepo.find({
        where: { conversationId: conv.id },
      });
      const participantUserIds = participants.map((p) => p.userId).sort();
      const targetIds = [...participantIds].sort();
      if (JSON.stringify(participantUserIds) === JSON.stringify(targetIds)) {
        return conv;
      }
    }

    return null;
  }
}
