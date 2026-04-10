import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../../shared/modules/redis.module';
import { ConversationParticipantOrmEntity } from '../../infrastructure/persistence/conversation-participant.orm-entity';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { MarkReadUseCase } from '../../application/use-cases/mark-read.use-case';
import { MessageType } from '../../infrastructure/persistence/message.orm-entity';

@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly ONLINE_KEY_PREFIX = 'online:';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    @InjectRepository(ConversationParticipantOrmEntity)
    private readonly participantRepo: Repository<ConversationParticipantOrmEntity>,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly markReadUseCase: MarkReadUseCase,
  ) {}

  async afterInit(server: Server): Promise<void> {
    this.sendMessageUseCase.setSocketServer(server);
    this.logger.log('Chat WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.emit('error', { message: 'Authentication token required' });
        client.disconnect();
        return;
      }

      const jwtSecret = this.configService.get<string>('jwt.accessSecret');
      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        token,
        { secret: jwtSecret },
      );

      const userId = payload.sub;
      client.data.userId = userId;

      // Join user to their conversation rooms
      const participations = await this.participantRepo.find({
        where: { userId },
      });

      for (const participation of participations) {
        await client.join(participation.conversationId);
      }

      // Track online status in Redis
      await this.redis.set(
        `${this.ONLINE_KEY_PREFIX}${userId}`,
        Date.now().toString(),
        'EX',
        300, // 5 minutes TTL
      );
      await this.redis.sadd('online_users', userId);

      // Broadcast online status to others
      this.server.emit('user_online', { userId });

      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    } catch (err) {
      this.logger.warn(`Connection rejected: ${(err as Error).message}`);
      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      await this.redis.del(`${this.ONLINE_KEY_PREFIX}${userId}`);
      await this.redis.srem('online_users', userId);

      // Broadcast offline status
      this.server.emit('user_offline', { userId });

      this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ): Promise<void> {
    const userId = client.data.userId as string;
    if (!userId) throw new WsException('Unauthorized');

    const participant = await this.participantRepo.findOne({
      where: { conversationId: data.conversationId, userId },
    });

    if (!participant) {
      throw new WsException('You are not a participant in this conversation');
    }

    await client.join(data.conversationId);
    this.logger.debug(`User ${userId} joined room ${data.conversationId}`);
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ): Promise<void> {
    await client.leave(data.conversationId);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      type?: MessageType;
      mediaUrl?: string;
      latitude?: number;
      longitude?: number;
    },
  ): Promise<void> {
    const userId = client.data.userId as string;
    if (!userId) throw new WsException('Unauthorized');

    try {
      await this.sendMessageUseCase.execute({
        conversationId: data.conversationId,
        senderId: userId,
        content: data.content,
        type: data.type ?? MessageType.TEXT,
        mediaUrl: data.mediaUrl,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    } catch (err) {
      throw new WsException((err as Error).message);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ): void {
    const userId = client.data.userId as string;
    if (!userId) return;

    client.to(data.conversationId).emit('typing', {
      userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ): Promise<void> {
    const userId = client.data.userId as string;
    if (!userId) throw new WsException('Unauthorized');

    try {
      await this.markReadUseCase.execute(data.conversationId, userId);

      this.server.to(data.conversationId).emit('message_read', {
        conversationId: data.conversationId,
        userId,
      });
    } catch (err) {
      throw new WsException((err as Error).message);
    }
  }
}
