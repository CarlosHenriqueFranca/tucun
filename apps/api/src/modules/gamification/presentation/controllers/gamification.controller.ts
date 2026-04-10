import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { GetLeaderboardUseCase } from '../../application/use-cases/get-leaderboard.use-case';
import { GetUserBadgesUseCase } from '../../application/use-cases/get-user-badges.use-case';
import { BadgeOrmEntity } from '../../infrastructure/persistence/badge.orm-entity';
import { XpEventOrmEntity } from '../../infrastructure/persistence/xp-event.orm-entity';

class XpHistoryQuery {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

@ApiTags('gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(
    private readonly getLeaderboardUseCase: GetLeaderboardUseCase,
    private readonly getUserBadgesUseCase: GetUserBadgesUseCase,
    @InjectRepository(BadgeOrmEntity)
    private readonly badgeRepository: Repository<BadgeOrmEntity>,
    @InjectRepository(XpEventOrmEntity)
    private readonly xpEventRepository: Repository<XpEventOrmEntity>,
  ) {}

  @Get('leaderboard')
  @Public()
  @ApiOperation({ summary: 'Get top 100 users by XP' })
  async getLeaderboard() {
    return this.getLeaderboardUseCase.execute();
  }

  @Get('badges')
  @Public()
  @ApiOperation({ summary: 'Get all available badges' })
  async getAllBadges() {
    return this.badgeRepository.find({ order: { xpRequired: 'ASC' } });
  }

  @Get('my-badges')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my earned badges with rarity breakdown' })
  async getMyBadges(@CurrentUser() user: CurrentUserPayload) {
    return this.getUserBadgesUseCase.execute(user.sub);
  }

  @Get('xp-history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get paginated XP event history' })
  async getXpHistory(
    @Query() query: XpHistoryQuery,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.xpEventRepository.findAndCount({
      where: { userId: user.sub },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }
}
