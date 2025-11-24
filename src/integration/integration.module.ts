import { Module } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { ZapierController } from './controllers/zapier.controller';
import { CRMController } from './controllers/crm.controller';
import { DesignToolController } from './controllers/design-tool.controller';
import { MarketingAutomationController } from './controllers/marketing-automation.controller';
import { IntegrationService } from './services/integration.service';
import { WebhookService } from './services/webhook.service';
import { ApiKeyService } from './services/api-key.service';
import { OAuthService } from './services/oauth.service';
import { RateLimitService } from './services/rate-limit.service';
import { ZapierService } from './services/zapier.service';
import { CRMService } from './services/crm/crm.service';
import { SalesforceService } from './services/crm/salesforce.service';
import { HubSpotService } from './services/crm/hubspot.service';
import { PipedriveService } from './services/crm/pipedrive.service';
import { CRMWebhookService } from './services/crm/crm-webhook.service';
import { DesignToolService } from './services/design-tools/design-tool.service';
import { CanvaService } from './services/design-tools/canva.service';
import { AdobeService } from './services/design-tools/adobe.service';
import { UnsplashService } from './services/design-tools/unsplash.service';
import { PexelsService } from './services/design-tools/pexels.service';
import { MarketingAutomationService } from './services/marketing-automation/marketing-automation.service';
import { MailchimpService } from './services/marketing-automation/mailchimp.service';
import { ActiveCampaignService } from './services/marketing-automation/activecampaign.service';
import { CRMSyncCron } from './cron/crm-sync.cron';
import { ZapierTriggerUtil } from './utils/zapier-trigger.util';
import { PrismaModule } from '../prisma/prisma.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [
    IntegrationController,
    ZapierController,
    CRMController,
    DesignToolController,
    MarketingAutomationController,
  ],
  providers: [
    IntegrationService,
    WebhookService,
    ApiKeyService,
    OAuthService,
    RateLimitService,
    ZapierService,
    CRMService,
    SalesforceService,
    HubSpotService,
    PipedriveService,
    CRMWebhookService,
    DesignToolService,
    CanvaService,
    AdobeService,
    UnsplashService,
    PexelsService,
    MarketingAutomationService,
    MailchimpService,
    ActiveCampaignService,
    CRMSyncCron,
    ZapierTriggerUtil,
  ],
  exports: [
    IntegrationService,
    WebhookService,
    ApiKeyService,
    OAuthService,
    RateLimitService,
    ZapierService,
    CRMService,
    SalesforceService,
    HubSpotService,
    PipedriveService,
    CRMWebhookService,
    DesignToolService,
    CanvaService,
    AdobeService,
    UnsplashService,
    PexelsService,
    MarketingAutomationService,
    MailchimpService,
    ActiveCampaignService,
    ZapierTriggerUtil,
  ],
})
export class IntegrationModule {}
