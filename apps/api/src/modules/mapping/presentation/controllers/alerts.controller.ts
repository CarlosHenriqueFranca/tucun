import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { CreateAlertDto } from '../../application/dtos/create-alert.dto';
import { CreateAlertUseCase } from '../../application/use-cases/create-alert.use-case';
import { GetNearbyAlertsUseCase } from '../../application/use-cases/get-nearby-alerts.use-case';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteAlertOrmEntity } from '../../infrastructure/persistence/route-alert.orm-entity';
import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsInt, IsOptional, Max, Min } from 'class-validator';

class NearbyAlertsQuery {
  @IsLatitude()
  @Type(() => Number)
  lat: number;

  @IsLongitude()
  @Type(() => Number)
  lng: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500000)
  @Type(() => Number)
  radius?: number;
}

class VoteAlertDto {
  @ApiProperty({ enum: ['up', 'down'] })
  @IsEnum(['up', 'down'])
  vote: 'up' | 'down';
}

@ApiTags('mapping')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(
    private readonly createAlertUseCase: CreateAlertUseCase,
    private readonly getNearbyAlertsUseCase: GetNearbyAlertsUseCase,
    @InjectRepository(RouteAlertOrmEntity)
    private readonly alertRepository: Repository<RouteAlertOrmEntity>,
  ) {}

  @Get('nearby')
  @Public()
  @ApiOperation({ summary: 'Get nearby route alerts' })
  async getNearby(@Query() query: NearbyAlertsQuery) {
    return this.getNearbyAlertsUseCase.execute({
      latitude: query.lat,
      longitude: query.lng,
      radius: query.radius ?? 50000,
    });
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Report a route alert' })
  async create(
    @Body() dto: CreateAlertDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.createAlertUseCase.execute(dto, user.sub);
  }

  @Post(':id/vote')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upvote or downvote an alert' })
  @ApiBody({ type: VoteAlertDto })
  async vote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: VoteAlertDto,
    @CurrentUser() _user: CurrentUserPayload,
  ) {
    const alert = await this.alertRepository.findOneOrFail({ where: { id } });

    if (body.vote === 'up') {
      alert.upvotes += 1;
    } else {
      alert.downvotes += 1;
    }

    return this.alertRepository.save(alert);
  }

  @Patch(':id/verify')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify an alert (moderator only)' })
  async verify(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() _user: CurrentUserPayload,
  ) {
    await this.alertRepository.update(id, { isVerified: true });
    return this.alertRepository.findOneOrFail({ where: { id } });
  }
}
