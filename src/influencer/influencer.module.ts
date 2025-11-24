import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Influencer, InfluencerSchema } from './schemas/influencer.schema';
import { InfluencerController } from './influencer.controller';
import { InfluencerCampaignController } from './controllers/influencer-campaign.controller';
import { InfluencerDiscoveryService } from './services/influencer-discovery.service';
import { InfluencerAnalysisService } from './services/influencer-analysis.service';
import { AuthenticityCheckerService } from './services/authenticity-checker.service';
import { EngagementAnalyzerService } from './services/engagement-analyzer.service';
import { InfluencerScoringService } from './services/influencer-scoring.service';
import { InfluencerCampaignService } from './services/influencer-campaign.service';
import { InfluencerCollaborationService } from './services/influencer-collaboration.service';
import { InfluencerRelationshipService } from './services/influencer-relationship.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Influencer.name, schema: InfluencerSchema },
    ]),
    PrismaModule,
  ],
  controllers: [
    InfluencerController,
    InfluencerCampaignController,
  ],
  providers: [
    InfluencerDiscoveryService,
    InfluencerAnalysisService,
    AuthenticityCheckerService,
    EngagementAnalyzerService,
    InfluencerScoringService,
    InfluencerCampaignService,
    InfluencerCollaborationService,
    InfluencerRelationshipService,
  ],
  exports: [
    InfluencerDiscoveryService,
    InfluencerAnalysisService,
    AuthenticityCheckerService,
    EngagementAnalyzerService,
    InfluencerScoringService,
    InfluencerCampaignService,
    InfluencerCollaborationService,
    InfluencerRelationshipService,
  ],
})
export class InfluencerModule {}
