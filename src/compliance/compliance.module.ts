import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { DataRetentionService } from './services/data-retention.service';
import { DataExportService } from './services/data-export.service';
import { DataDeletionService } from './services/data-deletion.service';
import { ComplianceReportService } from './services/compliance-report.service';
import { ConsentManagementService } from './services/consent-management.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    DataRetentionService,
    DataExportService,
    DataDeletionService,
    ComplianceReportService,
    ConsentManagementService,
  ],
  exports: [
    ComplianceService,
    DataRetentionService,
    DataExportService,
    DataDeletionService,
    ComplianceReportService,
    ConsentManagementService,
  ],
})
export class ComplianceModule {}
