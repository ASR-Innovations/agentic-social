import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaidSocialService } from './paid-social.service';
import {
  CreateAdCampaignDto,
  UpdateAdCampaignDto,
  CreateAdSetDto,
  CreateAdDto,
  BoostPostDto,
  AdPerformanceQueryDto,
  CreateBudgetAlertDto,
} from './dto';

@ApiTags('Paid Social')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('paid-social')
export class PaidSocialController {
  constructor(private readonly paidSocialService: PaidSocialService) {}

  @Post('campaigns')
  @ApiOperation({ summary: 'Create a new ad campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  async createCampaign(@Request() req: any, @Body() dto: CreateAdCampaignDto) {
    return this.paidSocialService.createCampaign(
      req.user.workspaceId,
      req.user.userId,
      dto,
    );
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all ad campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async getCampaigns(@Request() req: any) {
    return this.paidSocialService.getCampaigns(req.user.workspaceId);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get a single ad campaign' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  async getCampaign(@Request() req: any, @Param('id') id: string) {
    return this.paidSocialService.getCampaign(id, req.user.workspaceId);
  }

  @Put('campaigns/:id')
  @ApiOperation({ summary: 'Update an ad campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  async updateCampaign(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAdCampaignDto,
  ) {
    return this.paidSocialService.updateCampaign(id, req.user.workspaceId, dto);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete an ad campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  async deleteCampaign(@Request() req: any, @Param('id') id: string) {
    return this.paidSocialService.deleteCampaign(id, req.user.workspaceId);
  }

  @Post('campaigns/:id/ad-sets')
  @ApiOperation({ summary: 'Create an ad set within a campaign' })
  @ApiResponse({ status: 201, description: 'Ad set created successfully' })
  async createAdSet(
    @Request() req: any,
    @Param('id') campaignId: string,
    @Body() dto: CreateAdSetDto,
  ) {
    return this.paidSocialService.createAdSet(campaignId, req.user.workspaceId, dto);
  }

  @Post('ad-sets/:id/ads')
  @ApiOperation({ summary: 'Create an ad within an ad set' })
  @ApiResponse({ status: 201, description: 'Ad created successfully' })
  async createAd(
    @Request() req: any,
    @Param('id') adSetId: string,
    @Body() dto: CreateAdDto,
  ) {
    return this.paidSocialService.createAd(adSetId, req.user.workspaceId, dto);
  }

  @Post('boost-post')
  @ApiOperation({ summary: 'Boost an organic post' })
  @ApiResponse({ status: 201, description: 'Post boosted successfully' })
  async boostPost(@Request() req: any, @Body() dto: BoostPostDto) {
    return this.paidSocialService.boostPost(
      req.user.workspaceId,
      req.user.userId,
      dto,
    );
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get ad performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance data retrieved successfully' })
  async getPerformance(@Request() req: any, @Query() query: AdPerformanceQueryDto) {
    return this.paidSocialService.getPerformance(req.user.workspaceId, query);
  }

  @Post('campaigns/:id/budget-alerts')
  @ApiOperation({ summary: 'Create a budget alert for a campaign' })
  @ApiResponse({ status: 201, description: 'Budget alert created successfully' })
  async createBudgetAlert(
    @Request() req: any,
    @Param('id') campaignId: string,
    @Body() dto: CreateBudgetAlertDto,
  ) {
    return this.paidSocialService.createBudgetAlert(
      campaignId,
      req.user.workspaceId,
      dto,
    );
  }

  @Post('campaigns/:id/sync-performance')
  @ApiOperation({ summary: 'Sync performance data from platforms' })
  @ApiResponse({ status: 200, description: 'Performance data synced successfully' })
  async syncPerformance(@Request() req: any, @Param('id') campaignId: string) {
    return this.paidSocialService.syncPerformanceData(
      campaignId,
      req.user.workspaceId,
    );
  }

  @Get('reports/unified')
  @ApiOperation({ summary: 'Get unified organic + paid reporting' })
  @ApiResponse({ status: 200, description: 'Unified report retrieved successfully' })
  async getUnifiedReport(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.paidSocialService.getUnifiedReport(
      req.user.workspaceId,
      startDate,
      endDate,
    );
  }
}
