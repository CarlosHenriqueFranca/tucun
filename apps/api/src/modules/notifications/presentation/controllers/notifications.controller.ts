import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
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
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { GetNotificationsUseCase } from '../../application/use-cases/get-notifications.use-case';
import { MarkNotificationsReadUseCase } from '../../application/use-cases/mark-notifications-read.use-case';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PushTokenOrmEntity,
  DevicePlatform,
} from '../../infrastructure/persistence/push-token.orm-entity';

class RegisterPushTokenDto {
  @ApiProperty({ description: 'FCM push token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ enum: DevicePlatform })
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @ApiProperty({ description: 'Device unique identifier' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}

class RemovePushTokenDto {
  @ApiProperty({ description: 'FCM push token to remove' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class NotificationsController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationsReadUseCase: MarkNotificationsReadUseCase,
    @InjectRepository(PushTokenOrmEntity)
    private readonly pushTokenRepo: Repository<PushTokenOrmEntity>,
  ) {}

  @Get('notifications')
  @ApiOperation({ summary: 'Get my notifications (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getNotifications(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.getNotificationsUseCase.execute({
      userId: user.sub,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post('notifications/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: CurrentUserPayload) {
    return this.markNotificationsReadUseCase.markAll(user.sub);
  }

  @Post('notifications/read/:id')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  async markOneRead(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.markNotificationsReadUseCase.markOne(id, user.sub);
  }

  @Post('push-tokens')
  @ApiOperation({ summary: 'Register a push notification token' })
  @ApiResponse({ status: 201, description: 'Token registered' })
  async registerPushToken(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RegisterPushTokenDto,
  ) {
    const existing = await this.pushTokenRepo.findOne({
      where: { token: dto.token },
    });

    if (existing) {
      // Update to associate with current user if different
      existing.userId = user.sub;
      existing.deviceId = dto.deviceId;
      existing.platform = dto.platform;
      return this.pushTokenRepo.save(existing);
    }

    const pushToken = this.pushTokenRepo.create({
      userId: user.sub,
      token: dto.token,
      platform: dto.platform,
      deviceId: dto.deviceId,
    });

    return this.pushTokenRepo.save(pushToken);
  }

  @Delete('push-tokens')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a push notification token' })
  async removePushToken(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RemovePushTokenDto,
  ) {
    await this.pushTokenRepo.delete({ token: dto.token, userId: user.sub });
  }
}
