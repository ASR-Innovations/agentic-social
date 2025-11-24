import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CRMWebhookService } from '../services/crm/crm-webhook.service';

@Injectable()
export class CRMSyncCron {
  private readonly logger = new Logger(CRMSyncCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crmWebhookService: CRMWebhookService,
  ) {}

  /**
   * Sync contacts to CRM every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncContactsToCRM() {
    this.logger.log('Starting hourly CRM contact sync');

    try {
      // Get all workspaces with active CRM integrations
      const workspaces = await this.prisma.workspace.findMany({
        where: {
          integrations: {
            some: {
              type: 'CRM',
              status: 'ACTIVE',
            },
          },
        },
      });

      for (const workspace of workspaces) {
        try {
          await this.crmWebhookService.scheduledContactSync(workspace.id);
        } catch (error) {
          this.logger.error(`Failed to sync contacts for workspace ${workspace.id}`, error);
        }
      }

      this.logger.log('Hourly CRM contact sync completed');
    } catch (error) {
      this.logger.error('Hourly CRM contact sync failed', error);
    }
  }

  /**
   * Bidirectional sync from CRM every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async bidirectionalSync() {
    this.logger.log('Starting bidirectional CRM sync');

    try {
      const workspaces = await this.prisma.workspace.findMany({
        where: {
          integrations: {
            some: {
              type: 'CRM',
              status: 'ACTIVE',
            },
          },
        },
      });

      for (const workspace of workspaces) {
        try {
          await this.crmWebhookService.scheduledBidirectionalSync(workspace.id);
        } catch (error) {
          this.logger.error(`Failed bidirectional sync for workspace ${workspace.id}`, error);
        }
      }

      this.logger.log('Bidirectional CRM sync completed');
    } catch (error) {
      this.logger.error('Bidirectional CRM sync failed', error);
    }
  }
}
