import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostOrmEntity } from './infrastructure/persistence/post.orm-entity';
import { PostLikeOrmEntity } from './infrastructure/persistence/post-like.orm-entity';
import { PostCommentOrmEntity } from './infrastructure/persistence/post-comment.orm-entity';
import { StoryOrmEntity } from './infrastructure/persistence/story.orm-entity';
import { FollowOrmEntity } from './infrastructure/persistence/follow.orm-entity';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { GetFeedUseCase } from './application/use-cases/get-feed.use-case';
import { LikePostUseCase } from './application/use-cases/like-post.use-case';
import { CommentPostUseCase } from './application/use-cases/comment-post.use-case';
import { CreateStoryUseCase } from './application/use-cases/create-story.use-case';
import { GetStoriesUseCase } from './application/use-cases/get-stories.use-case';
import { FollowUserUseCase } from './application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from './application/use-cases/unfollow-user.use-case';
import { MediaUploadService } from './application/services/media-upload.service';
import { FeedController } from './presentation/controllers/feed.controller';
import { StoriesController } from './presentation/controllers/stories.controller';
import { UploadController } from './presentation/controllers/upload.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostOrmEntity,
      PostLikeOrmEntity,
      PostCommentOrmEntity,
      StoryOrmEntity,
      FollowOrmEntity,
    ]),
  ],
  controllers: [FeedController, StoriesController, UploadController],
  providers: [
    CreatePostUseCase,
    GetFeedUseCase,
    LikePostUseCase,
    CommentPostUseCase,
    CreateStoryUseCase,
    GetStoriesUseCase,
    FollowUserUseCase,
    UnfollowUserUseCase,
    MediaUploadService,
  ],
  exports: [MediaUploadService, FollowUserUseCase, UnfollowUserUseCase],
})
export class SocialModule {}
