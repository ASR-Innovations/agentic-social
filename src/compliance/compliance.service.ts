import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataRetentionService } from './services/data-retention.service';
import { DataExportService } from './services/data-export.service';
import { DataDeletionService } from './services/data-deletion.service';
import { ConsentManagementService } from './services/consent-management.service';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private dataRetentionService: DataRetentionService,
    private dataExportService: DataExportService,
    private dataDeletionService: DataDeletionService,
    private consentManagementService: ConsentManagementService,
  ) {}

  // Run data retention policies daily at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDataRetention() {
    this.logger.log('Running scheduled data retention policies');
    try {
      await this.dataRetentionService.executePolicies();
    } catch (error) {
      this.logger.error('Failed to execute data retention policies:', error);
    }
  }

  // Process scheduled deletions every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledDeletions() {
    this.logger.log('Processing scheduled deletions');
    try {
      await this.dataDeletionService.processScheduledDeletions();
    } catch (error) {
      this.logger.error('Failed to process scheduled deletions:', error);
    }
  }

  // Cleanup expired exports daily at 3 AM
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleExpiredExports() {
    this.logger.log('Cleaning up expired exports');
    try {
      await this.dataExportService.cleanupExpiredExports();
    } catch (error) {
      this.logger.error('Failed to cleanup expired exports:', error);
    }
  }

  // Cleanup expired consents daily at 4 AM
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleExpiredConsents() {
    this.logger.log('Cleaning up expired consents');
    try {
      await this.consentManagementService.cleanupExpiredConsents();
    } catch (error) {
      this.logger.error('Failed to cleanup expired consents:', error);
    }
  }
}
