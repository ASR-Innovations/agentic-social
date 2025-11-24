import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({ description: 'User ID to send notification to' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Workspace ID' })
  @IsString()
  workspaceId: string;

  @ApiProperty({
    description: 'Notification type',
    enum: ['mention', 'message', 'approval', 'alert', 'post_published', 'post_failed', 'crisis', 'review'],
  })
  @IsEnum(['mention', 'message', 'approval', 'alert', 'post_published', 'post_failed', 'crisis', 'review'])
  type: 'mention' | 'message' | 'approval' | 'alert' | 'post_published' | 'post_failed' | 'crisis' | 'review';

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Additional data', required: false })
  @IsOptional()
  @IsObject()
  data?: any;
}

export class NotificationResponseDto {
  @ApiProperty({ description: 'Notification ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Workspace ID' })
  workspaceId: string;

  @ApiProperty({ description: 'Notification type' })
  type: string;

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  message: string;

  @ApiProperty({ description: 'Additional data', required: false })
  data?: any;

  @ApiProperty({ description: 'Read status' })
  read: boolean;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;
}
