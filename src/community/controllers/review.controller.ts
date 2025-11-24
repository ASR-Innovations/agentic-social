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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReviewService } from '../services/review.service';
import { ReviewSentimentService } from '../services/review-sentiment.service';
import { ReputationScoreService } from '../services/reputation-score.service';
import { ReviewAlertService } from '../services/review-alert.service';
import { ReviewResponseService } from '../services/review-response.service';
import { ReviewTemplateService } from '../services/review-template.service';
import { ReviewAnalyticsService } from '../services/review-analytics.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { CreateReviewResponseDto } from '../dto/create-review-response.dto';
import { CreateReviewTemplateDto, UpdateReviewTemplateDto } from '../dto/create-review-template.dto';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly sentimentService: ReviewSentimentService,
    private readonly reputationService: ReputationScoreService,
    private readonly alertService: ReviewAlertService,
    private readonly responseService: ReviewResponseService,
    private readonly templateService: ReviewTemplateService,
    private readonly analyticsService: ReviewAnalyticsService,
  ) {}

  // ============================================
  // Review Management
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async createReview(@Request() req: any, @Body() dto: CreateReviewDto) {
    const workspaceId = req.user.workspaceId;
    const review = await this.reviewService.create(workspaceId, dto);

    // Analyze sentiment
    await this.sentimentService.updateReviewSentiment(review.id);

    // Check for alerts
    await this.alertService.checkNegativeReview(review.id);

    return review;
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews with filters' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async getReviews(@Request() req: any, @Query() query: QueryReviewsDto) {
    const workspaceId = req.user.workspaceId;
    return this.reviewService.findAll(workspaceId, query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get review statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(
    @Request() req: any,
    @Query('platform') platform?: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.reviewService.getStatistics(workspaceId, {
      platform,
      locationId,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single review' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  async getReview(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.reviewService.findOne(workspaceId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async updateReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.reviewService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteReview(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.reviewService.remove(workspaceId, id);
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update reviews' })
  @ApiResponse({ status: 200, description: 'Reviews updated successfully' })
  async bulkUpdateReviews(
    @Request() req: any,
    @Body() body: { reviewIds: string[]; updates: UpdateReviewDto },
  ) {
    const workspaceId = req.user.workspaceId;
    return this.reviewService.bulkUpdate(workspaceId, body.reviewIds, body.updates);
  }

  // ============================================
  // Review Responses
  // ============================================

  @Post('responses')
  @ApiOperation({ summary: 'Create a response to a review' })
  @ApiResponse({ status: 201, description: 'Response created successfully' })
  async createResponse(@Request() req: any, @Body() dto: CreateReviewResponseDto) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.id;
    return this.responseService.createResponse(workspaceId, userId, dto);
  }

  @Post('responses/:id/publish')
  @ApiOperation({ summary: 'Publish a review response' })
  @ApiResponse({ status: 200, description: 'Response published successfully' })
  async publishResponse(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.responseService.publishResponse(id, userId);
  }

  @Post('responses/:id/approve')
  @ApiOperation({ summary: 'Approve a review response' })
  @ApiResponse({ status: 200, description: 'Response approved successfully' })
  async approveResponse(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.responseService.approveResponse(id, userId);
  }

  @Get(':reviewId/responses')
  @ApiOperation({ summary: 'Get responses for a review' })
  @ApiResponse({ status: 200, description: 'Responses retrieved successfully' })
  async getResponses(@Param('reviewId') reviewId: string) {
    return this.responseService.getResponsesForReview(reviewId);
  }

  // ============================================
  // Review Templates
  // ============================================

  @Post('templates')
  @ApiOperation({ summary: 'Create a review template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(@Request() req: any, @Body() dto: CreateReviewTemplateDto) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.id;
    return this.templateService.create(workspaceId, userId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all review templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(
    @Request() req: any,
    @Query('category') category?: string,
    @Query('sentiment') sentiment?: string,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.templateService.findAll(workspaceId, {
      category,
      sentiment,
      isActive,
      search,
    });
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a single template' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  async getTemplate(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.templateService.findOne(workspaceId, id);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update a template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateReviewTemplateDto,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.templateService.update(workspaceId, id, dto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete a template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  async deleteTemplate(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.templateService.remove(workspaceId, id);
  }

  @Get(':reviewId/suggested-templates')
  @ApiOperation({ summary: 'Get suggested templates for a review' })
  @ApiResponse({ status: 200, description: 'Suggested templates retrieved successfully' })
  async getSuggestedTemplates(@Request() req: any, @Param('reviewId') reviewId: string) {
    const workspaceId = req.user.workspaceId;
    return this.templateService.getSuggestedTemplates(workspaceId, reviewId);
  }

  @Post('templates/generate-from-template')
  @ApiOperation({ summary: 'Generate response from template' })
  @ApiResponse({ status: 200, description: 'Response generated successfully' })
  async generateFromTemplate(
    @Body() body: { templateId: string; reviewId: string; variables?: Record<string, string> },
  ) {
    return this.responseService.generateFromTemplate(
      body.templateId,
      body.reviewId,
      body.variables,
    );
  }

  // ============================================
  // Reputation & Analytics
  // ============================================

  @Get('reputation/current')
  @ApiOperation({ summary: 'Get current reputation score' })
  @ApiResponse({ status: 200, description: 'Reputation score retrieved successfully' })
  async getCurrentReputation(
    @Request() req: any,
    @Query('platform') platform?: string,
    @Query('locationId') locationId?: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.reputationService.getCurrentReputation(workspaceId, platform, locationId);
  }

  @Get('reputation/trends')
  @ApiOperation({ summary: 'Get reputation trends' })
  @ApiResponse({ status: 200, description: 'Reputation trends retrieved successfully' })
  async getReputationTrends(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('platform') platform?: string,
    @Query('locationId') locationId?: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.reputationService.getReputationTrends(
      workspaceId,
      new Date(startDate),
      new Date(endDate),
      platform,
      locationId,
    );
  }

  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Get review analytics dashboard' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalyticsDashboard(
    @Request() req: any,
    @Query('platform') platform?: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.analyticsService.getDashboard(workspaceId, {
      platform,
      locationId,
      startDate,
      endDate,
    });
  }

  @Get('analytics/volume-trends')
  @ApiOperation({ summary: 'Get review volume trends' })
  @ApiResponse({ status: 200, description: 'Volume trends retrieved successfully' })
  async getVolumeTrends(@Request() req: any, @Query('days') days?: number) {
    const workspaceId = req.user.workspaceId;
    return this.analyticsService.getVolumeTrends(workspaceId, days ? Number(days) : 30);
  }

  @Get('analytics/comparison')
  @ApiOperation({ summary: 'Get comparison with previous period' })
  @ApiResponse({ status: 200, description: 'Comparison retrieved successfully' })
  async getComparison(@Request() req: any, @Query('days') days?: number) {
    const workspaceId = req.user.workspaceId;
    return this.analyticsService.getComparison(workspaceId, days ? Number(days) : 30);
  }

  // ============================================
  // Alerts
  // ============================================

  @Get('alerts/active')
  @ApiOperation({ summary: 'Get active alerts' })
  @ApiResponse({ status: 200, description: 'Active alerts retrieved successfully' })
  async getActiveAlerts(@Request() req: any) {
    const workspaceId = req.user.workspaceId;
    return this.alertService.getActiveAlerts(workspaceId);
  }

  @Post('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully' })
  async acknowledgeAlert(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.alertService.acknowledgeAlert(id, userId);
  }

  @Post('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  @ApiResponse({ status: 200, description: 'Alert resolved successfully' })
  async resolveAlert(@Param('id') id: string) {
    return this.alertService.resolveAlert(id);
  }

  @Post('alerts/run-checks')
  @ApiOperation({ summary: 'Run all alert checks' })
  @ApiResponse({ status: 200, description: 'Alert checks completed' })
  async runAlertChecks(@Request() req: any) {
    const workspaceId = req.user.workspaceId;
    return this.alertService.runAlertChecks(workspaceId);
  }
}
