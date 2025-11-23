import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Post, PostPlatform } from './entities/post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostPublishProcessor } from './processors/post-publish.processor';
import { SocialAccountModule } from '../social-account/social-account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostPlatform]),
    BullModule.registerQueue({
      name: 'post-publishing',
    }),
    SocialAccountModule,
  ],
  controllers: [PostController],
  providers: [PostService, PostPublishProcessor],
  exports: [PostService],
})
export class PostModule {}
