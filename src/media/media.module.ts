import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { S3Service } from './s3.service';
import { VideoService } from './video.service';
import { VideoAnalyticsService } from './video-analytics.service';
import { VideoSchedulingService } from './video-scheduling.service';
import {
  VideoAnalytics,
  VideoAnalyticsSchema,
} from './schemas/video-analytics.schema';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MongooseModule.forFeature([
      { name: VideoAnalytics.name, schema: VideoAnalyticsSchema },
    ]),
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    S3Service,
    VideoService,
    VideoAnalyticsService,
    VideoSchedulingService,
  ],
  exports: [
    MediaService,
    S3Service,
    VideoService,
    VideoAnalyticsService,
    VideoSchedulingService,
  ],
})
export class MediaModule {}