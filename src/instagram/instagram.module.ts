import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InstagramController } from './instagram.controller';
import { InstagramGridService } from './services/instagram-grid.service';
import { InstagramStoryService } from './services/instagram-story.service';
import { InstagramAestheticService } from './services/instagram-aesthetic.service';
import { InstagramShopService } from './services/instagram-shop.service';
import { InstagramReelsService } from './services/instagram-reels.service';

@Module({
  imports: [PrismaModule],
  controllers: [InstagramController],
  providers: [
    InstagramGridService,
    InstagramStoryService,
    InstagramAestheticService,
    InstagramShopService,
    InstagramReelsService,
  ],
  exports: [
    InstagramGridService,
    InstagramStoryService,
    InstagramAestheticService,
    InstagramShopService,
    InstagramReelsService,
  ],
})
export class InstagramModule {}
