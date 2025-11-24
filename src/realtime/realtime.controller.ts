import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RealtimeService } from './services/realtime.service';
import { PresenceService } from './services/presence.service';
import { NotificationService } from './services/notification.service';
import {
  SendNotificationDto,
  NotificationResponseDto,
} from './dto/notification.dto';
import {
  WorkspacePresenceDto,
  PresenceResponseDto,
} from './dto/presence.dto';

/**
 * Controller for real-time features management
 */
@ApiTags('Real-time')
@Controller('realtime')
export class RealtimeController {
  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly presenceService: PresenceService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Get workspace presence information
   */
  @Get('presence/workspace/:workspaceId')
  @ApiOperation({ summary: 'Get online users in workspace' })
  @ApiResponse({
    status: 200,
    description: 'Workspace presence information',
    type: WorkspacePresenceDto,
  })
  async getWorkspacePresence(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspacePresenceDto> {
    const onlineUsers = await this.presenceService.getWorkspacePresence(workspaceId);
    
    return {
      workspaceId,
      onlineUsers,
      onlineCount: onlineUsers.length,
    };
  }

  /**
   * Get user presence information
   */
  @Get('presence/user/:userId/workspace/:workspaceId')
  @ApiOperation({ summary: 'Get user presence status' })
  @ApiResponse({
    status: 200,
    description: 'User presence information',
    type: PresenceResponseDto,
  })
  async getUserPresence(
    @Param('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<PresenceResponseDto | null> {
    return this.presenceService.getUserPresence(userId, workspaceId);
  }

  /**
   * Send notification to user
   */
  @Post('notifications/send')
  @ApiOperation({ summary: 'Send real-time notification to user' })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully',
  })
  async sendNotification(
    @Body() dto: SendNotificationDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.notificationService.sendNotification(dto);
    
    return {
      success: true,
      message: 'Notification sent successfully',
    };
  }

  /**
   * Get connection statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get real-time connection statistics' })
  @ApiResponse({
    status: 200,
    description: 'Connection statistics',
  })
  async getStats(): Promise<{
    totalConnections: number;
    timestamp: Date;
  }> {
    return {
      totalConnections: this.realtimeService.getTotalConnectionCount(),
      timestamp: new Date(),
    };
  }

  /**
   * Get workspace connection statistics
   */
  @Get('stats/workspace/:workspaceId')
  @ApiOperation({ summary: 'Get workspace connection statistics' })
  @ApiResponse({
    status: 200,
    description: 'Workspace connection statistics',
  })
  async getWorkspaceStats(
    @Param('workspaceId') workspaceId: string,
  ): Promise<{
    workspaceId: string;
    connections: number;
    onlineUsers: number;
    timestamp: Date;
  }> {
    const connections = this.realtimeService.getWorkspaceConnectionCount(workspaceId);
    const onlineUsers = await this.presenceService.getOnlineUserCount(workspaceId);

    return {
      workspaceId,
      connections,
      onlineUsers,
      timestamp: new Date(),
    };
  }
}
