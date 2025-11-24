import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PresenceService } from '../services/presence.service';

/**
 * Cron job to clean up stale presence data
 * Runs every 5 minutes to remove inactive users
 */
@Injectable()
export class PresenceCleanupCron {
  private readonly logger = new Logger(PresenceCleanupCron.name);

  constructor(private readonly presenceService: PresenceService) {}

  /**
   * Clean up stale presence records every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handlePresenceCleanup(): Promise<void> {
    try {
      this.logger.debug('Starting presence cleanup...');
      await this.presenceService.cleanupStalePresence();
      this.logger.debug('Presence cleanup completed');
    } catch (error) {
      this.logger.error('Error during presence cleanup', error);
    }
  }
}
