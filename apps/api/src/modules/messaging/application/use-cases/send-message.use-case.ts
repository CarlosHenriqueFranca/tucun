import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { ConversationOrmEntity } from '../../infrastructure/persistence/conversation.orm-entity';
import { ConversationParticipantOrmEntity } from '../../infrastructure/persistence/conversation-participant.orm-entity';
import { MessageOrmEntity, MessageType } from '../../infrastructure/persistence/message.orm-entity';
import { SendMessageDto } from '../dtos/send-message.dto';

export interface SendMessageInput extends SendMessageDto {
  conversationId: string;
  senderId: string;
}

@Injectable()
export class SendMessageUseCase {
  private socketServer: Server | null = null;

  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepo: Repository<ConversationOrmEntity>,
    @InjectRepository(ConversationParticipantOrmEntity)
    private readonly participantRepo: Repository<ConversationParticipantOrmEntity>,
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepo: Repository<MessageOrmEntity>,
  ) {}

  setSocketServer(server: Server): void {
    this.socketServer = server;
  }

  async execute(input: SendMessageInput): Promise<MessageOrmEntity> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: input.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const participant = await this.participantRepo.findOne({
      where: { conversationId: input.conversationId, userId: input.senderId },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const message = this.messageRepo.create({
      conversationId: input.conversationId,
      senderId: input.senderId,
      content: input.content,
      type: input.type ?? MessageType.TEXT,
      mediaUrl: input.mediaUrl ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      isRead: false,
      deletedAt: null,
    });

    const savedMessage = await this.messageRepo.save(message);

    // Update conversation lastMessageAt
    await this.conversationRepo.update(input.conversationId, {
      lastMessageAt: savedMessage.createdAt,
    });

    // Emit to socket room
    if (this.socketServer) {
      this.socketServer
        .to(input.conversationId)
        .emit('new_message', {
          message: savedMessage,
          conversationId: input.conversationId,
        });
    }

    return savedMessage;
  }
}
