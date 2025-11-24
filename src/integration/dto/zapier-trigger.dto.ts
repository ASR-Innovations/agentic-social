import { IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeTriggerDto {
  @ApiProperty({
    description: 'The URL where Zapier will receive webhook notifications',
    example: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
  })
  @IsUrl()
  targetUrl: string;

  @ApiPropertyOptional({
    description: 'Unique subscription ID from Zapier',
    example: 'sub_abc123',
  })
  @IsOptional()
  @IsString()
  subscriptionId?: string;
}

export class UnsubscribeTriggerDto {
  @ApiPropertyOptional({
    description: 'Unique subscription ID from Zapier',
    example: 'sub_abc123',
  })
  @IsOptional()
  @IsString()
  subscriptionId?: string;
}

export class TriggerWebhookDto {
  @ApiProperty({
    description: 'The trigger key to activate',
    example: 'post_published',
  })
  @IsString()
  triggerKey: string;

  @ApiProperty({
    description: 'Data to send with the webhook',
    example: { postId: 'post_123', content: 'Hello World' },
  })
  data: any;
}
