import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { CreateSpotDto } from '../../application/dtos/create-spot.dto';
import { RateSpotDto } from '../../application/dtos/rate-spot.dto';
import { SearchSpotsDto } from '../../application/dtos/search-spots.dto';
import { CreateSpotUseCase } from '../../application/use-cases/create-spot.use-case';
import { GetNearbySpotsUseCase } from '../../application/use-cases/get-nearby-spots.use-case';
import { GetSpotUseCase } from '../../application/use-cases/get-spot.use-case';
import { RateSpotUseCase } from '../../application/use-cases/rate-spot.use-case';
import { SpotChecklistOrmEntity } from '../../infrastructure/persistence/spot-checklist.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('mapping')
@Controller('spots')
@UseGuards(JwtAuthGuard)
export class SpotsController {
  constructor(
    private readonly createSpotUseCase: CreateSpotUseCase,
    private readonly getNearbySpotsUseCase: GetNearbySpotsUseCase,
    private readonly getSpotUseCase: GetSpotUseCase,
    private readonly rateSpotUseCase: RateSpotUseCase,
    @InjectRepository(SpotChecklistOrmEntity)
    private readonly checklistRepository: Repository<SpotChecklistOrmEntity>,
  ) {}

  @Get('nearby')
  @Public()
  @ApiOperation({ summary: 'Get nearby fishing spots' })
  async getNearby(@Query() query: SearchSpotsDto) {
    return this.getNearbySpotsUseCase.execute({
      latitude: query.latitude,
      longitude: query.longitude,
      radius: query.radius ?? 50000,
      type: query.type,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new fishing spot (requires subscription)' })
  async create(
    @Body() dto: CreateSpotDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.createSpotUseCase.execute(dto, user.sub);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get spot details with checklist and ratings' })
  async getSpot(@Param('id', ParseUUIDPipe) id: string) {
    return this.getSpotUseCase.execute(id);
  }

  @Post(':id/rate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Rate a spot' })
  async rate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RateSpotDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.rateSpotUseCase.execute(id, user.sub, dto);
  }

  @Get(':id/checklist')
  @Public()
  @ApiOperation({ summary: 'Get checklist items for a spot' })
  async getChecklist(@Param('id', ParseUUIDPipe) id: string) {
    return this.checklistRepository.find({
      where: { spotId: id },
      order: { category: 'ASC' },
    });
  }
}
