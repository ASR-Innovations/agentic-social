import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RealtimeGateway } from './gateways/realtime.gateway';
import { NotificationGateway } from './gateways/notification.gateway';
import { PresenceGateway } from './gateways/presence.gateway';
import { DashboardGateway } from './gateways/dashboard.gateway';
import { RealtimeService } from './services/realtime.service';
import { PresenceService } from './services/presence.service';
import { NotificationService } from './services/notification.service';
import { PresenceCleanupCron } from './cron/presence-cleanup.cron';
import { RealtimeController } from './realtime.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Real-time module providing WebSocket functionality
 * Coordinates all real-time features across the platform
 * 
 * Features:
 * - WebSocket server with Socket.io
 * - Real-time dashboard updates
 * - Live inbox message sync
 * - Real-time notifications
 * - Team presence and collaboration
 */
@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [RealtimeController],
  providers: [
    // Core services
    RealtimeService,
    PresenceService,
    NotificationService,
    
    // WebSocket gateways
    RealtimeGateway,
    NotificationGateway,
    PresenceGateway,
    DashboardGateway,
    
    // Cron jobs
    PresenceCleanupCron,
  ],
  exports: [
    RealtimeService,
    PresenceService,
    NotificationService,
    RealtimeGateway,
    NotificationGateway,
    PresenceGateway,
    DashboardGateway,
  ],
})
export class RealtimeModule {}
