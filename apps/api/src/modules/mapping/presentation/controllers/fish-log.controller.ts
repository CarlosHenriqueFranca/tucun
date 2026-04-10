import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { CreateFishLogUseCase } from '../../application/use-cases/create-fish-log.use-case';
import { CreateFishLogDto } from '../../application/dtos/create-fish-log.dto';
import { FishLogOrmEntity } from '../../infrastructure/persistence/fish-log.orm-entity';

export interface FishStats {
  totalCatches: number;
  speciesCaught: number;
  totalWeight: number;
  biggestCatch: FishLogOrmEntity | null;
}

@ApiTags('Fish Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fish-logs')
export class FishLogController {
  constructor(
    private readonly createFishLogUseCase: CreateFishLogUseCase,
    @InjectRepository(FishLogOrmEntity)
    private readonly fishLogRepo: Repository<FishLogOrmEntity>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Log a fish catch' })
  @ApiResponse({ status: 201, description: 'Catch logged, XP awarded' })
  async createFishLog(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateFishLogDto,
  ) {
    return this.createFishLogUseCase.execute(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my fishing history (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFishHistory(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    const skip = (p - 1) * l;

    const [items, total] = await this.fishLogRepo.findAndCount({
      where: { userId: user.sub },
      order: { caughtAt: 'DESC' },
      relations: ['spot'],
      skip,
      take: l,
    });

    return { items, total, page: p, limit: l };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get my fishing stats' })
  @ApiResponse({
    status: 200,
    description: 'Stats: totalCatches, speciesCaught, totalWeight, biggestCatch',
  })
  async getFishStats(@CurrentUser() user: CurrentUserPayload): Promise<FishStats> {
    const totalCatches = await this.fishLogRepo.count({
      where: { userId: user.sub },
    });

    const speciesResult = await this.fishLogRepo
      .createQueryBuilder('fl')
      .select('COUNT(DISTINCT fl.speciesId)', 'count')
      .where('fl.userId = :userId', { userId: user.sub })
      .getRawOne<{ count: string }>();

    const speciesCaught = parseInt(speciesResult?.count ?? '0', 10);

    const weightResult = await this.fishLogRepo
      .createQueryBuilder('fl')
      .select('SUM(fl.weightKg)', 'total')
      .where('fl.userId = :userId', { userId: user.sub })
      .andWhere('fl.weightKg IS NOT NULL')
      .getRawOne<{ total: string | null }>();

    const totalWeight = parseFloat(weightResult?.total ?? '0') || 0;

    const biggestCatch = await this.fishLogRepo.findOne({
      where: { userId: user.sub },
      order: { weightKg: 'DESC' },
      relations: ['spot'],
    });

    return {
      totalCatches,
      speciesCaught,
      totalWeight,
      biggestCatch: biggestCatch ?? null,
    };
  }
}
