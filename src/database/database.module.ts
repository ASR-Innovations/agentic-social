/**
 * Database Module
 * 
 * Provides database optimization services including:
 * - Connection pooling
 * - Query optimization
 * - Materialized view management
 * - Database maintenance
 * 
 * Requirements: 31.2, 31.3
 */

import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseMaintenanceService } from './database-maintenance.service';
import { DatabaseMaintenanceController } from './database-maintenance.controller';

@Global()
@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [DatabaseMaintenanceController],
  providers: [DatabaseMaintenanceService],
  exports: [DatabaseMaintenanceService],
})
export class DatabaseModule {}
