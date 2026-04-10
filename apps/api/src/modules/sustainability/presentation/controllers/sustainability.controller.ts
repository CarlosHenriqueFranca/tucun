import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { GetFishSpeciesUseCase } from '../../application/use-cases/get-fish-species.use-case';
import { GetFishSpeciesDetailUseCase } from '../../application/use-cases/get-fish-species-detail.use-case';
import { GetPiracemaStatusUseCase } from '../../application/use-cases/get-piracema-status.use-case';
import { CreateEcoReportUseCase } from '../../application/use-cases/create-eco-report.use-case';
import { ConservationStatus } from '../../infrastructure/persistence/fish-species.orm-entity';
import { EcoReportType } from '../../infrastructure/persistence/eco-report.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EcoReportOrmEntity } from '../../infrastructure/persistence/eco-report.orm-entity';

class CreateEcoReportDto {
  @ApiProperty({ enum: EcoReportType })
  @IsEnum(EcoReportType)
  type: EcoReportType;

  @ApiProperty({ description: 'Description of the environmental incident' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Latitude of the incident' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude of the incident' })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ description: 'Media URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}

@ApiTags('Sustainability')
@Controller()
export class SustainabilityController {
  constructor(
    private readonly getFishSpeciesUseCase: GetFishSpeciesUseCase,
    private readonly getFishSpeciesDetailUseCase: GetFishSpeciesDetailUseCase,
    private readonly getPiracemaStatusUseCase: GetPiracemaStatusUseCase,
    private readonly createEcoReportUseCase: CreateEcoReportUseCase,
    @InjectRepository(EcoReportOrmEntity)
    private readonly ecoReportRepo: Repository<EcoReportOrmEntity>,
  ) {}

  @Get('fish')
  @ApiOperation({ summary: 'List all fish species' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'conservationStatus', required: false, enum: ConservationStatus })
  @ApiQuery({ name: 'isProtectedInRondonia', required: false, type: Boolean })
  @ApiQuery({ name: 'isEndemic', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFishSpecies(
    @Query('name') name?: string,
    @Query('conservationStatus') conservationStatus?: ConservationStatus,
    @Query('isProtectedInRondonia') isProtectedInRondonia?: string,
    @Query('isEndemic') isEndemic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.getFishSpeciesUseCase.execute({
      name,
      conservationStatus,
      isProtectedInRondonia:
        isProtectedInRondonia !== undefined
          ? isProtectedInRondonia === 'true'
          : undefined,
      isEndemic: isEndemic !== undefined ? isEndemic === 'true' : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('fish/:id')
  @ApiOperation({ summary: 'Get fish species detail' })
  async getFishSpeciesDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.getFishSpeciesDetailUseCase.execute(id);
  }

  @Get('piracema')
  @ApiOperation({ summary: 'Get current piracema status' })
  async getPiracemaStatus() {
    return this.getPiracemaStatusUseCase.getCurrentStatus();
  }

  @Get('piracema/calendar')
  @ApiOperation({ summary: 'Get annual piracema calendar' })
  async getPiracemaCalendar() {
    return this.getPiracemaStatusUseCase.getAnnualCalendar();
  }

  @Post('eco-reports')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit an environmental report' })
  @ApiResponse({ status: 201, description: 'Report submitted, 25 XP awarded' })
  async createEcoReport(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateEcoReportDto,
  ) {
    return this.createEcoReportUseCase.execute({
      userId: user.sub,
      ...dto,
    });
  }

  @Get('eco-reports')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List eco reports (moderator/admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getEcoReports(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (user.role !== 'admin' && user.role !== 'moderator') {
      throw new ForbiddenException('Only moderators and admins can view reports');
    }

    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;

    const [items, total] = await this.ecoReportRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (p - 1) * l,
      take: l,
    });

    return { items, total, page: p, limit: l };
  }
}
