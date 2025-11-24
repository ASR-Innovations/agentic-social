import { IsString, IsOptional, IsObject, IsEnum, IsArray, IsBoolean, IsEmail, IsNumber } from 'class-validator';

export enum MarketingAutomationProvider {
  MAILCHIMP = 'mailchimp',
  ACTIVECAMPAIGN = 'activecampaign',
}

export enum SyncDirection {
  TO_PLATFORM = 'to_platform',
  FROM_PLATFORM = 'from_platform',
  BIDIRECTIONAL = 'bidirectional',
}

export enum TriggerEvent {
  NEW_FOLLOWER = 'new_follower',
  POST_PUBLISHED = 'post_published',
  COMMENT_RECEIVED = 'comment_received',
  DM_RECEIVED = 'dm_received',
  MENTION_DETECTED = 'mention_detected',
  ENGAGEMENT_THRESHOLD = 'engagement_threshold',
  SENTIMENT_CHANGE = 'sentiment_change',
  CAMPAIGN_COMPLETED = 'campaign_completed',
}

export class CreateMarketingAutomationIntegrationDto {
  @IsEnum(MarketingAutomationProvider)
  provider: MarketingAutomationProvider;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  credentials: {
    apiKey?: string;
    apiUrl?: string;
    accountId?: string;
    accessToken?: string;
  };

  @IsOptional()
  @IsObject()
  syncConfig?: {
    direction: SyncDirection;
    syncInterval: number; // in minutes
    autoSync: boolean;
    audienceFields: string[];
  };
}

export class SyncAudienceDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  socialProfiles?: {
    platform: string;
    username: string;
    url: string;
    followers?: number;
    engagement?: number;
  }[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsString()
  listId?: string; // Target list/audience ID
}

export class CreateWorkflowTriggerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TriggerEvent)
  event: TriggerEvent;

  @IsOptional()
  @IsObject()
  conditions?: {
    platform?: string[];
    sentiment?: string[];
    engagementMin?: number;
    keywords?: string[];
  };

  @IsObject()
  action: {
    type: 'add_to_list' | 'send_email' | 'update_contact' | 'start_automation' | 'add_tag';
    listId?: string;
    campaignId?: string;
    automationId?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SendCampaignDto {
  @IsString()
  campaignId: string;

  @IsOptional()
  @IsString()
  listId?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];

  @IsOptional()
  @IsObject()
  segmentCriteria?: {
    tags?: string[];
    customFields?: Record<string, any>;
    socialEngagement?: {
      min?: number;
      max?: number;
    };
  };
}

export class CreateListDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  defaultFields?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  doubleOptIn?: boolean;
}

export class AddToListDto {
  @IsString()
  listId: string;

  @IsArray()
  contacts: SyncAudienceDto[];

  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;
}

export class UpdateContactDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsObject()
  socialData?: {
    platform: string;
    username: string;
    followers: number;
    engagementRate: number;
    lastInteraction: Date;
  };
}

export class TrackEventDto {
  @IsEmail()
  email: string;

  @IsString()
  eventName: string;

  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;

  @IsOptional()
  @IsString()
  eventValue?: string;
}

export class GetAudienceStatsDto {
  @IsOptional()
  @IsString()
  listId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  dateRange?: {
    start: Date;
    end: Date;
  };
}
