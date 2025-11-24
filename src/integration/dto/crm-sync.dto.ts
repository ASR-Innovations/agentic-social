import { IsString, IsOptional, IsObject, IsEnum, IsArray, IsBoolean } from 'class-validator';

export enum CRMProvider {
  SALESFORCE = 'salesforce',
  HUBSPOT = 'hubspot',
  PIPEDRIVE = 'pipedrive',
}

export enum SyncDirection {
  TO_CRM = 'to_crm',
  FROM_CRM = 'from_crm',
  BIDIRECTIONAL = 'bidirectional',
}

export class CreateCRMIntegrationDto {
  @IsEnum(CRMProvider)
  provider: CRMProvider;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    domain?: string;
    refreshToken?: string;
    accessToken?: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsObject()
  syncConfig?: {
    direction: SyncDirection;
    syncInterval: number; // in minutes
    autoSync: boolean;
    contactFields: string[];
    leadFields: string[];
  };
}

export class SyncContactDto {
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  phone?: string;

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
}

export class SyncLeadDto {
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  source: string; // e.g., "instagram_dm", "facebook_comment"

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsObject()
  socialContext?: {
    platform: string;
    conversationId: string;
    sentiment: string;
    engagementScore: number;
  };

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class ContactEnrichmentDto {
  @IsString()
  contactId: string;

  @IsEnum(CRMProvider)
  provider: CRMProvider;

  @IsOptional()
  @IsBoolean()
  includeSocialData?: boolean;

  @IsOptional()
  @IsBoolean()
  includeEngagementHistory?: boolean;
}

export class LeadAttributionDto {
  @IsString()
  leadId: string;

  @IsString()
  source: string; // Social platform

  @IsOptional()
  @IsString()
  campaign?: string;

  @IsOptional()
  @IsString()
  postId?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsObject()
  touchpoints?: {
    timestamp: Date;
    platform: string;
    type: string; // "view", "click", "comment", "dm"
    postId?: string;
  }[];
}
