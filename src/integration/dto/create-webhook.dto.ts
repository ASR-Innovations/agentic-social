import { IsString, IsEnum, IsArray, IsOptional, IsObject, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WebhookEventType {
  POST_PUBLISHED = 'POST_PUBLISHED',
  POST_SCHEDULED = 'POST_SCHEDULED',
  POST_FAILED = 'POST_FAILED',
  MENTION_RECEIVED = 'MENTION_RECEIVED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  CONVERSATION_ASSIGNED = 'CONVERSATION_ASSIGNED',
  ALERT_TRIGGERED = 'ALERT_TRIGGERED',
  CAMPAIGN_STARTED = 'CAMPAIGN_STARTED',
  CAMPAIGN_COMPLETED = 'CAMPAIGN_COMPLETED',
  APPROVAL_REQUESTED = 'APPROVAL_REQUESTED',
  APPROVAL_COMPLETED = 'APPROVAL_COMPLETED',
}

export class CreateWebhookDto {
  @ApiProperty({ description: 'Webhook name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Webhook URL' })
  @IsUrl()
  url: string;

  @ApiProperty({ enum: WebhookEventType, isArray: true, description: 'Events that trigger this webhook' })
  @IsArray()
  @IsEnum(WebhookEventType, { each: true })
  events: WebhookEventType[];

  @ApiPropertyOptional({ description: 'Integration ID (if webhook is part of an integration)' })
  @IsOptional()
  @IsString()
  integrationId?: string;

  @ApiPropertyOptional({ description: 'Custom headers' })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Retry configuration' })
  @IsOptional()
  @IsObject()
  retryConfig?: {
    maxRetries?: number;
    backoffMultiplier?: number;
  };
}
