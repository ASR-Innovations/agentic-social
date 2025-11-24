/**
 * Database Maintenance Controller
 * 
 * Provides API endpoints for database maintenance operations
 * 
 * Requirements: 31.2, 31.3
 */

import { Controller, Post, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DatabaseMaintenanceService } from './database-maintenance.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAnalyzer } from './query-optimizer';

// Note: Add appropriate auth guards based on your auth implementation
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Database Maintenance')
@Controller('admin/database')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('ADMIN', 'OWNER')
@ApiBearerAuth()
export class DatabaseMaintenanceController {
  private readonly queryAnalyzer: QueryAnalyzer;
  
  constructor(
    private readonly maintenanceService: DatabaseMaintenanceService,
    private readonly prisma: PrismaService,
  ) {
    this.queryAnalyzer = new QueryAnalyzer(prisma);
  }
  
  @Post('maintenance/full')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run full database maintenance' })
  @ApiResponse({ status: 200, description: 'Maintenance completed successfully' })
  async runFullMaintenance() {
    return this.maintenanceService.runFullMaintenance();
  }
  
  @Post('maintenance/refresh-views')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh all materialized views' })
  @ApiResponse({ status: 200, description: 'Views refreshed successfully' })
  async refreshViews() {
    await this.maintenanceService.refreshMaterializedViews();
    return { success: true, message: 'Materialized views refreshed' };
  }
  
  @Post('maintenance/create-partitions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create upcoming partitions' })
  @ApiResponse({ status: 200, description: 'Partitions created successfully' })
  async createPartitions() {
    await this.maintenanceService.createUpcomingPartitions();
    return { success: true, message: 'Partitions created' };
  }
  
  @Post('maintenance/vacuum')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vacuum and analyze tables' })
  @ApiResponse({ status: 200, description: 'Vacuum completed successfully' })
  async vacuumTables() {
    await this.maintenanceService.vacuumAndAnalyze();
    return { success: true, message: 'Vacuum and analyze completed' };
  }
  
  @Get('health')
  @ApiOperation({ summary: 'Check database health' })
  @ApiResponse({ status: 200, description: 'Database health status' })
  async checkHealth() {
    const healthy = await this.prisma.healthCheck();
    const metrics = await this.prisma.getPoolMetrics();
    
    return {
      healthy,
      metrics,
      timestamp: new Date(),
    };
  }
  
  @Get('metrics/slow-queries')
  @ApiOperation({ summary: 'Get slow queries' })
  @ApiResponse({ status: 200, description: 'List of slow queries' })
  async getSlowQueries() {
    const queries = await this.queryAnalyzer.getSlowQueries(1000);
    return {
      count: queries.length,
      queries,
    };
  }
  
  @Get('metrics/index-stats')
  @ApiOperation({ summary: 'Get index usage statistics' })
  @ApiResponse({ status: 200, description: 'Index usage statistics' })
  async getIndexStats() {
    const stats = await this.queryAnalyzer.getIndexStats();
    return {
      count: stats.length,
      stats,
    };
  }
  
  @Get('metrics/table-bloat')
  @ApiOperation({ summary: 'Get table bloat information' })
  @ApiResponse({ status: 200, description: 'Table bloat statistics' })
  async getTableBloat() {
    const bloat = await this.maintenanceService.getTableBloat();
    return {
      count: bloat.length,
      bloat,
    };
  }
  
  @Get('metrics/unused-indexes')
  @ApiOperation({ summary: 'Find unused indexes' })
  @ApiResponse({ status: 200, description: 'List of unused indexes' })
  async getUnusedIndexes() {
    const indexes = await this.maintenanceService.findUnusedIndexes();
    return {
      count: indexes.length,
      indexes,
    };
  }
  
  @Get('metrics/connection-pool')
  @ApiOperation({ summary: 'Get connection pool metrics' })
  @ApiResponse({ status: 200, description: 'Connection pool statistics' })
  async getPoolMetrics() {
    const metrics = await this.prisma.getPoolMetrics();
    return {
      metrics,
      timestamp: new Date(),
    };
  }
}
