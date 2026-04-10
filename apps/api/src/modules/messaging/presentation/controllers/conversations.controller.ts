import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { CreateConversationUseCase } from '../../application/use-cases/create-conversation.use-case';
import { GetConversationsUseCase } from '../../application/use-cases/get-conversations.use-case';
import { GetMessagesUseCase } from '../../application/use-cases/get-messages.use-case';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { MarkReadUseCase } from '../../application/use-cases/mark-read.use-case';
import { CreateConversationDto } from '../../application/dtos/create-conversation.dto';
import { SendMessageDto } from '../../application/dtos/send-message.dto';

@ApiTags('Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly markReadUseCase: MarkReadUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get my conversations' })
  @ApiResponse({ status: 200, description: 'List of conversations with meta' })
  async getConversations(@CurrentUser() user: CurrentUserPayload) {
    return this.getConversationsUseCase.execute(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a DM or group conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created or existing DM returned' })
  async createConversation(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateConversationDto,
  ) {
    return this.createConversationUseCase.execute(user.sub, dto);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get message history for a conversation' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessages(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.getMessagesUseCase.execute({
      conversationId: id,
      userId: user.sub,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message via REST (WebSocket fallback)' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.sendMessageUseCase.execute({
      conversationId: id,
      senderId: user.sub,
      ...dto,
    });
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark messages in conversation as read' })
  @ApiResponse({ status: 204, description: 'Marked as read' })
  async markRead(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.markReadUseCase.execute(id, user.sub);
  }
}
