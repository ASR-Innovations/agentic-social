import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('posts/:postId')
  async getPostAnalytics(@Request() req, @Param('postId') postId: string) {
    return this.analyticsService.getPostAnalytics(req.user.tenantId, postId);
  }

  @Get('tenant')
  async getTenantAnalytics(
    @Request() req,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end) : new Date();

    return this.analyticsService.getTenantAnalytics(req.user.tenantId, startDate, endDate);
  }
}
