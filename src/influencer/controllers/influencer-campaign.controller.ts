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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InfluencerCampaignService } from '../services/influencer-campaign.service';
import { InfluencerCollaborationService } from '../services/influencer-collaboration.service';
import { InfluencerRelationshipService } from '../services/influencer-relationship.service';
import { CreateInfluencerCampaignDto } from '../dto/create-influencer-campaign.dto';
import { UpdateInfluencerCampaignDto } from '../dto/update-influencer-campaign.dto';
import { QueryCampaignsDto } from '../dto/query-campaigns.dto';
import { CreateCollaborationDto } from '../dto/create-collaboration.dto';
import { UpdateCollaborationDto } from '../dto/update-collaboration.dto';
import { QueryCollaborationsDto } from '../dto/query-collaborations.dto';
import { AddInfluencerNoteDto } from '../dto/add-influencer-note.dto';

@Controller('api/influencers/campaigns')
@UseGuards(JwtAuthGuard)
export class InfluencerCampaignController {
  constructor(
    private readonly campaignService: InfluencerCampaignService,
    private readonly collaborationService: InfluencerCollaborationService,
    private readonly relationshipService: InfluencerRelationshipService,
  ) {}

  // ============================================
  // Campaign Management
  // ============================================

  /**
   * Create a new influencer campaign
   * POST /api/influencers/campaigns
   */
  @Post()
  async createCampaign(@Request() req: any, @Body() dto: CreateInfluencerCampaignDto) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.createCampaign(workspaceId, dto);
  }

  /**
   * List all campaigns
   * GET /api/influencers/campaigns
   */
  @Get()
  async listCampaigns(@Request() req: any, @Query() query: QueryCampaignsDto) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.listCampaigns(workspaceId, query);
  }

  /**
   * Get campaign by ID
   * GET /api/influencers/campaigns/:id
   */
  @Get(':id')
  async getCampaign(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.getCampaignById(workspaceId, id);
  }

  /**
   * Update campaign
   * PUT /api/influencers/campaigns/:id
   */
  @Put(':id')
  async updateCampaign(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateInfluencerCampaignDto,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.updateCampaign(workspaceId, id, dto);
  }

  /**
   * Delete campaign
   * DELETE /api/influencers/campaigns/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCampaign(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    await this.campaignService.deleteCampaign(workspaceId, id);
  }

  /**
   * Get campaign analytics
   * GET /api/influencers/campaigns/:id/analytics
   */
  @Get(':id/analytics')
  async getCampaignAnalytics(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.getCampaignAnalytics(workspaceId, id);
  }

  /**
   * Find matching influencers for campaign
   * GET /api/influencers/campaigns/:id/matches
   */
  @Get(':id/matches')
  async findMatchingInfluencers(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.findMatchingInfluencers(workspaceId, id);
  }

  // ============================================
  // Collaboration Management
  // ============================================

  /**
   * Create a new collaboration
   * POST /api/influencers/campaigns/collaborations
   */
  @Post('collaborations')
  async createCollaboration(@Request() req: any, @Body() dto: CreateCollaborationDto) {
    const workspaceId = req.user.workspaceId;
    return this.collaborationService.createCollaboration(workspaceId, dto);
  }

  /**
   * List collaborations
   * GET /api/influencers/campaigns/collaborations
   */
  @Get('collaborations/list')
  async listCollaborations(@Request() req: any, @Query() query: QueryCollaborationsDto) {
    const workspaceId = req.user.workspaceId;
    return this.collaborationService.listCollaborations(workspaceId, query);
  }

  /**
   * Get collaboration by ID
   * GET /api/influencers/campaigns/collaborations/:id
   */
  @Get('collaborations/:id')
  async getCollaboration(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.collaborationService.getCollaborationById(workspaceId, id);
  }

  /**
   * Update collaboration
   * PUT /api/influencers/campaigns/collaborations/:id
   */
  @Put('collaborations/:id')
  async updateCollaboration(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCollaborationDto,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.collaborationService.updateCollaboration(workspaceId, id, dto);
  }

  /**
   * Delete collaboration
   * DELETE /api/influencers/campaigns/collaborations/:id
   */
  @Delete('collaborations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCollaboration(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    await this.collaborationService.deleteCollaboration(workspaceId, id);
  }

  /**
   * Track deliverable completion
   * POST /api/influencers/campaigns/collaborations/:id/deliverables
   */
  @Post('collaborations/:id/deliverables')
  async trackDeliverable(
    @Request() req: any,
    @Param('id') id: string,
    @Body('deliverable') deliverable: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.collaborationService.trackDeliverable(workspaceId, id, deliverable);
  }

  /**
   * Update performance metrics
   * PUT /api/influencers/campaigns/collaborations/:id/metrics
   */
  @Put('collaborations/:id/metrics')
  async updatePerformanceMetrics(
    @Request() req: any,
    @Param('id') id: string,
    @Body() metrics: {
      reach?: number;
      engagement?: number;
      conversions?: number;
      impressions?: number;
      clicks?: number;
      roi?: number;
    },
  ) {
    const workspaceId = req.user.workspaceId;
    return this.collaborationService.updatePerformanceMetrics(workspaceId, id, metrics);
  }

  /**
   * Get collaboration performance
   * GET /api/influencers/campaigns/collaborations/:id/performance
   */
  @Get('collaborations/:id/performance')
  async getCollaborationPerformance(@Request() req: any, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.collaborationService.getCollaborationPerformance(workspaceId, id);
  }

  // ============================================
  // Relationship Management
  // ============================================

  /**
   * Add note to influencer
   * POST /api/influencers/:influencerId/notes
   */
  @Post(':influencerId/notes')
  async addNote(
    @Request() req: any,
    @Param('influencerId') influencerId: string,
    @Body() dto: AddInfluencerNoteDto,
  ) {
    const workspaceId = req.user.workspaceId;
    const authorId = req.user.userId;
    return this.relationshipService.addNote(workspaceId, influencerId, authorId, dto);
  }

  /**
   * Get influencer notes
   * GET /api/influencers/:influencerId/notes
   */
  @Get(':influencerId/notes')
  async getNotes(@Request() req: any, @Param('influencerId') influencerId: string) {
    const workspaceId = req.user.workspaceId;
    return this.relationshipService.getNotes(workspaceId, influencerId);
  }

  /**
   * Update note
   * PUT /api/influencers/:influencerId/notes/:noteId
   */
  @Put(':influencerId/notes/:noteId')
  async updateNote(
    @Request() req: any,
    @Param('influencerId') influencerId: string,
    @Param('noteId') noteId: string,
    @Body('content') content: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.relationshipService.updateNote(workspaceId, influencerId, noteId, content);
  }

  /**
   * Delete note
   * DELETE /api/influencers/:influencerId/notes/:noteId
   */
  @Delete(':influencerId/notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNote(
    @Request() req: any,
    @Param('influencerId') influencerId: string,
    @Param('noteId') noteId: string,
  ) {
    const workspaceId = req.user.workspaceId;
    await this.relationshipService.deleteNote(workspaceId, influencerId, noteId);
  }

  /**
   * Get relationship history
   * GET /api/influencers/:influencerId/history
   */
  @Get(':influencerId/history')
  async getRelationshipHistory(
    @Request() req: any,
    @Param('influencerId') influencerId: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.relationshipService.getRelationshipHistory(workspaceId, influencerId);
  }

  /**
   * Get payment summary
   * GET /api/influencers/:influencerId/payments
   */
  @Get(':influencerId/payments')
  async getPaymentSummary(@Request() req: any, @Param('influencerId') influencerId: string) {
    const workspaceId = req.user.workspaceId;
    return this.relationshipService.getPaymentSummary(workspaceId, influencerId);
  }
}
