import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/conversation.orm-entity';
import { ConversationParticipantOrmEntity } from '../../infrastructure/persistence/conversation-participant.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/message.orm-entity';

export interface ConversationWithMeta {
  conversation: ConversationOrmEntity;
  lastMessage: MessageOrmEntity | null;
  unreadCount: number;
  participants: ConversationParticipantOrmEntity[];
}

@Injectable()
export class GetConversationsUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepo: Repository<ConversationOrmEntity>,
    @InjectRepository(ConversationParticipantOrmEntity)
    private readonly participantRepo: Repository<ConversationParticipantOrmEntity>,
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepo: Repository<MessageOrmEntity>,
  ) {}

  async execute(userId: string): Promise<ConversationWithMeta[]> {
    // Find all conversations the user participates in
    const myParticipations = await this.participantRepo.find({
      where: { userId },
    });

    if (myParticipations.length === 0) {
      return [];
    }

    const conversationIds = myParticipations.map((p) => p.conversationId);

    const conversations = await this.conversationRepo
      .createQueryBuilder('c')
      .where('c.id IN (:...ids)', { ids: conversationIds })
      .orderBy('c.lastMessageAt', 'DESC', 'NULLS LAST')
      .getMany();

    const results: ConversationWithMeta[] = await Promise.all(
      conversations.map(async (conv) => {
        const participants = await this.participantRepo.find({
          where: { conversationId: conv.id },
        });

        const myParticipant = participants.find((p) => p.userId === userId);

        const lastMessage = await this.messageRepo.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: 'DESC' },
        });

        let unreadCount = 0;
        if (myParticipant) {
          const lastReadAt = myParticipant.lastReadAt;
          if (lastReadAt) {
            unreadCount = await this.messageRepo
              .createQueryBuilder('m')
              .where('m.conversationId = :convId', { convId: conv.id })
              .andWhere('m.senderId != :userId', { userId })
              .andWhere('m.createdAt > :lastReadAt', { lastReadAt })
              .andWhere('m.deletedAt IS NULL')
              .getCount();
          } else {
            unreadCount = await this.messageRepo.count({
              where: { conversationId: conv.id, isRead: false },
            });
          }
        }

        return {
          conversation: conv,
          lastMessage: lastMessage ?? null,
          unreadCount,
          participants,
        };
      }),
    );

    return results;
  }
}
