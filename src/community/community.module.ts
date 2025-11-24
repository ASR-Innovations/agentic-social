import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { ReviewController } from './controllers/review.controller';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { MessageCollectionService } from './services/message-collection.service';
import { ConversationThreadingService } from './services/conversation-threading.service';
import { InboxFilterService } from './services/inbox-filter.service';
import { SmartInboxRoutingService } from './services/smart-inbox-routing.service';
import { SavedReplyService } from './services/saved-reply.service';
import { ConversationHistoryService } from './services/conversation-history.service';
import { SLAService } from './services/sla.service';
import { ReviewService } from './services/review.service';
import { ReviewSentimentService } from './services/review-sentiment.service';
import { ReputationScoreService } from './services/reputation-score.service';
import { ReviewAlertService } from './services/review-alert.service';
import { ReviewResponseService } from './services/review-response.service';
import { ReviewTemplateService } from './services/review-template.service';
import { ReviewAnalyticsService } from './services/review-analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AIModule } from '../ai/ai.module';
import { InboxGateway } from './gateways/inbox.gateway';

@Module({
  imports: [PrismaModule, AIModule],
  controllers: [CommunityController, ReviewController],
  providers: [
    ConversationService,
    MessageService,
    MessageCollectionService,
    ConversationThreadingService,
    InboxFilterService,
    SmartInboxRoutingService,
    SavedReplyService,
    ConversationHistoryService,
    SLAService,
    ReviewService,
    ReviewSentimentService,
    ReputationScoreService,
    ReviewAlertService,
    ReviewResponseService,
    ReviewTemplateService,
    ReviewAnalyticsService,
    InboxGateway,
  ],
  exports: [
    ConversationService,
    MessageService,
    MessageCollectionService,
    SmartInboxRoutingService,
    SavedReplyService,
    ConversationHistoryService,
    SLAService,
    ReviewService,
    ReviewSentimentService,
    ReputationScoreService,
    ReviewAlertService,
    ReviewResponseService,
    ReviewTemplateService,
    ReviewAnalyticsService,
  ],
})
export class CommunityModule {}
