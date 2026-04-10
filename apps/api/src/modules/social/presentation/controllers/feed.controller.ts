import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../../../shared/decorators/current-user.decorator';
import { CreatePostDto } from '../../application/dtos/create-post.dto';
import { CreateCommentDto } from '../../application/dtos/create-comment.dto';
import { FeedQueryDto } from '../../application/dtos/feed-query.dto';
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { GetFeedUseCase } from '../../application/use-cases/get-feed.use-case';
import { LikePostUseCase } from '../../application/use-cases/like-post.use-case';
import { CommentPostUseCase } from '../../application/use-cases/comment-post.use-case';
import { PostOrmEntity } from '../../infrastructure/persistence/post.orm-entity';
import { PostCommentOrmEntity } from '../../infrastructure/persistence/post-comment.orm-entity';

@ApiTags('social')
@Controller()
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getFeedUseCase: GetFeedUseCase,
    private readonly likePostUseCase: LikePostUseCase,
    private readonly commentPostUseCase: CommentPostUseCase,
    @InjectRepository(PostOrmEntity)
    private readonly postRepository: Repository<PostOrmEntity>,
    @InjectRepository(PostCommentOrmEntity)
    private readonly commentRepository: Repository<PostCommentOrmEntity>,
  ) {}

  @Get('feed')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get paginated feed' })
  async getFeed(
    @Query() query: FeedQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.getFeedUseCase.execute(user.sub, query);
  }

  @Post('posts')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new post (requires subscription)' })
  async createPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.createPostUseCase.execute(dto, user.sub);
  }

  @Get('posts/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get post details' })
  async getPost(@Param('id', ParseUUIDPipe) id: string) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  @Delete('posts/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete own post' })
  async deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    if (post.userId !== user.sub) throw new ForbiddenException('You can only delete your own posts');

    await this.postRepository.remove(post);
    return { message: 'Post deleted successfully' };
  }

  @Post('posts/:id/like')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle like on a post' })
  async likePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.likePostUseCase.execute(id, user.sub);
  }

  @Get('posts/:id/comments')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get paginated comments for a post' })
  async getComments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.commentRepository.findAndCount({
      where: { postId: id, parentId: null as unknown as string },
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  @Post('posts/:id/comments')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add a comment to a post' })
  async addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commentPostUseCase.execute(id, user.sub, dto);
  }

  @Delete('posts/:id/comments/:commentId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete own comment' })
  async deleteComment(
    @Param('id', ParseUUIDPipe) _postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException(`Comment ${commentId} not found`);
    if (comment.userId !== user.sub) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
