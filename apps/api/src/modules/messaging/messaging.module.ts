import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConversationOrmEntity } from './infrastructure/persistence/conversation.orm-entity';
import { ConversationParticipantOrmEntity } from './infrastructure/persistence/conversation-participant.orm-entity';
import { MessageOrmEntity } from './infrastructure/persistence/message.orm-entity';
import { CreateConversationUseCase } from './application/use-cases/create-conversation.use-case';
import { GetConversationsUseCase } from './application/use-cases/get-conversations.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { MarkReadUseCase } from './application/use-cases/mark-read.use-case';
import { ChatGateway } from './presentation/gateways/chat.gateway';
import { ConversationsController } from './presentation/controllers/conversations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationOrmEntity,
      ConversationParticipantOrmEntity,
      MessageOrmEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
        return {
          secret: config.get<string>('JWT_ACCESS_SECRET', 'tucun_access_secret_change_in_prod'),
          signOptions: {
            expiresIn: expiresIn as unknown as number,
          },
        };
      },
    }),
  ],
  controllers: [ConversationsController],
  providers: [
    CreateConversationUseCase,
    GetConversationsUseCase,
    SendMessageUseCase,
    GetMessagesUseCase,
    MarkReadUseCase,
    ChatGateway,
  ],
  exports: [SendMessageUseCase],
})
export class MessagingModule {}
