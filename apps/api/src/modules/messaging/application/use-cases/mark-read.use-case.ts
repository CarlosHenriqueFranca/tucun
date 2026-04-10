import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationOrmEntity } from '../../infrastructure/persistence/conversation.orm-entity';
import { ConversationParticipantOrmEntity } from '../../infrastructure/persistence/conversation-participant.orm-entity';
import { MessageOrmEntity } from '../../infrastructure/persistence/message.orm-entity';

@Injectable()
export class MarkReadUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepo: Repository<ConversationOrmEntity>,
    @InjectRepository(ConversationParticipantOrmEntity)
    private readonly participantRepo: Repository<ConversationParticipantOrmEntity>,
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepo: Repository<MessageOrmEntity>,
  ) {}

  async execute(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const participant = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Mark all messages from others as read
    await this.messageRepo
      .createQueryBuilder()
      .update(MessageOrmEntity)
      .set({ isRead: true })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = false')
      .andWhere('deletedAt IS NULL')
      .execute();

    // Update participant lastReadAt
    await this.participantRepo.update(
      { conversationId, userId },
      { lastReadAt: new Date() },
    );
  }
}
