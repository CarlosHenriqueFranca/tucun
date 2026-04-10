import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateProfileDto } from '../../application/dtos/update-profile.dto';
import { GetProfileUseCase } from '../../application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../../../../shared/guards/optional-jwt.guard';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { Public } from '../../../../shared/decorators/public.decorator';
import { Inject } from '@nestjs/common';

interface CurrentUserPayload {
  sub: string;
  email: string;
  role: string;
  subscriptionTier: string;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: CurrentUserPayload) {
    return this.getProfileUseCase.execute({
      userId: user.sub,
      requesterId: user.sub,
    });
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Username already taken' })
  async updateMe(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute({
      userId: user.sub,
      dto,
    });
  }

  @Get(':username')
  @Public()
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Get public user profile by username' })
  @ApiParam({ name: 'username', description: 'Username to look up' })
  @ApiResponse({ status: 200, description: 'Public user profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(
    @Param('username') username: string,
    @CurrentUser() currentUser?: CurrentUserPayload,
  ) {
    return this.getProfileUseCase.execute({
      username,
      requesterId: currentUser?.sub,
    });
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiParam({ name: 'id', description: 'User ID to follow' })
  @ApiResponse({ status: 200, description: 'User followed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot follow yourself' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async followUser(
    @Param('id', ParseUUIDPipe) targetId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    if (targetId === currentUser.sub) {
      throw new ForbiddenException('You cannot follow yourself');
    }

    await this.userRepository.followUser(currentUser.sub, targetId);
    return { message: 'User followed successfully' };
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiParam({ name: 'id', description: 'User ID to unfollow' })
  @ApiResponse({ status: 200, description: 'User unfollowed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unfollowUser(
    @Param('id', ParseUUIDPipe) targetId: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    await this.userRepository.unfollowUser(currentUser.sub, targetId);
    return { message: 'User unfollowed successfully' };
  }

  @Get(':id/followers')
  @Public()
  @ApiOperation({ summary: 'Get followers of a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of followers' })
  async getFollowers(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const clampedLimit = Math.min(limit, 100);
    return this.userRepository.findFollowers(userId, { page, limit: clampedLimit });
  }

  @Get(':id/following')
  @Public()
  @ApiOperation({ summary: 'Get users that a user is following' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of following' })
  async getFollowing(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const clampedLimit = Math.min(limit, 100);
    return this.userRepository.findFollowing(userId, { page, limit: clampedLimit });
  }
}
