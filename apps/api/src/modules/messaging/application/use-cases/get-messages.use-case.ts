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

export interface GetMessagesInput {
  conversationId: string;
  userId: string;
  page?: number;
  limit?: number;
}

export interface PaginatedMessages {
  messages: MessageOrmEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class GetMessagesUseCase {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepo: Repository<ConversationOrmEntity>,
    @InjectRepository(ConversationParticipantOrmEntity)
    private readonly participantRepo: Repository<ConversationParticipantOrmEntity>,
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepo: Repository<MessageOrmEntity>,
  ) {}

  async execute(input: GetMessagesInput): Promise<PaginatedMessages> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: input.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const participant = await this.participantRepo.findOne({
      where: { conversationId: input.conversationId, userId: input.userId },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { conversationId: input.conversationId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Mark messages from others as read
    await this.messageRepo
      .createQueryBuilder()
      .update(MessageOrmEntity)
      .set({ isRead: true })
      .where('conversationId = :conversationId', { conversationId: input.conversationId })
      .andWhere('senderId != :userId', { userId: input.userId })
      .andWhere('isRead = false')
      .andWhere('deletedAt IS NULL')
      .execute();

    // Update participant lastReadAt
    await this.participantRepo.update(
      { conversationId: input.conversationId, userId: input.userId },
      { lastReadAt: new Date() },
    );

    return {
      messages: messages.reverse(), // chronological order
      total,
      page,
      limit,
    };
  }
}
