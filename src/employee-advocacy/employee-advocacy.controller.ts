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
import {
  EmployeeProfileService,
  AdvocacyContentService,
  EmployeeShareService,
  GamificationService,
  LeaderboardService,
  ContentSuggestionService,
  AdvocacySettingsService,
} from './services';
import {
  CreateEmployeeProfileDto,
  UpdateEmployeeProfileDto,
  CreateAdvocacyContentDto,
  UpdateAdvocacyContentDto,
  ApproveContentDto,
  ShareContentDto,
  QueryContentDto,
  UpdateAdvocacySettingsDto,
} from './dto';

@ApiTags('Employee Advocacy')
@Controller('employee-advocacy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeeAdvocacyController {
  constructor(
    private employeeProfileService: EmployeeProfileService,
    private advocacyContentService: AdvocacyContentService,
    private employeeShareService: EmployeeShareService,
    private gamificationService: GamificationService,
    private leaderboardService: LeaderboardService,
    private contentSuggestionService: ContentSuggestionService,
    private advocacySettingsService: AdvocacySettingsService,
  ) {}

  // Employee Profile Endpoints
  @Post('profiles')
  @ApiOperation({ summary: 'Create employee profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  async createProfile(@Request() req: any, @Body() dto: CreateEmployeeProfileDto) {
    return this.employeeProfileService.create(req.user.workspaceId, dto);
  }

  @Get('profiles')
  @ApiOperation({ summary: 'Get all employee profiles' })
  @ApiResponse({ status: 200, description: 'Profiles retrieved successfully' })
  async getProfiles(@Request() req: any, @Query('isActive') isActive?: string) {
    return this.employeeProfileService.findAll(req.user.workspaceId, {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get('profiles/me')
  @ApiOperation({ summary: 'Get current user employee profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getMyProfile(@Request() req: any) {
    return this.employeeProfileService.findByUserId(req.user.workspaceId, req.user.userId);
  }

  @Get('profiles/:id')
  @ApiOperation({ summary: 'Get employee profile by ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req: any, @Param('id') id: string) {
    return this.employeeProfileService.findOne(req.user.workspaceId, id);
  }

  @Put('profiles/:id')
  @ApiOperation({ summary: 'Update employee profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeProfileDto,
  ) {
    return this.employeeProfileService.update(req.user.workspaceId, id, dto);
  }

  @Post('profiles/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate employee profile' })
  @ApiResponse({ status: 200, description: 'Profile deactivated successfully' })
  async deactivateProfile(@Request() req: any, @Param('id') id: string) {
    return this.employeeProfileService.deactivate(req.user.workspaceId, id);
  }

  @Post('profiles/:id/activate')
  @ApiOperation({ summary: 'Activate employee profile' })
  @ApiResponse({ status: 200, description: 'Profile activated successfully' })
  async activateProfile(@Request() req: any, @Param('id') id: string) {
    return this.employeeProfileService.activate(req.user.workspaceId, id);
  }

  // Content Endpoints
  @Post('content')
  @ApiOperation({ summary: 'Create advocacy content' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  async createContent(@Request() req: any, @Body() dto: CreateAdvocacyContentDto) {
    return this.advocacyContentService.create(req.user.workspaceId, req.user.userId, dto);
  }

  @Get('content')
  @ApiOperation({ summary: 'Get all advocacy content' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  async getContent(@Request() req: any, @Query() query: QueryContentDto) {
    return this.advocacyContentService.findAll(req.user.workspaceId, query);
  }

  @Get('content/approved')
  @ApiOperation({ summary: 'Get approved content for sharing' })
  @ApiResponse({ status: 200, description: 'Approved content retrieved successfully' })
  async getApprovedContent(@Request() req: any, @Query() query: QueryContentDto) {
    return this.advocacyContentService.findApproved(req.user.workspaceId, query);
  }

  @Get('content/:id')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  async getContentById(@Request() req: any, @Param('id') id: string) {
    return this.advocacyContentService.findOne(req.user.workspaceId, id);
  }

  @Put('content/:id')
  @ApiOperation({ summary: 'Update advocacy content' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  async updateContent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAdvocacyContentDto,
  ) {
    return this.advocacyContentService.update(req.user.workspaceId, id, dto);
  }

  @Post('content/:id/approve')
  @ApiOperation({ summary: 'Approve or reject content' })
  @ApiResponse({ status: 200, description: 'Content approval status updated' })
  async approveContent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ApproveContentDto,
  ) {
    return this.advocacyContentService.approve(req.user.workspaceId, id, req.user.userId, dto);
  }

  @Delete('content/:id')
  @ApiOperation({ summary: 'Delete advocacy content' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  async deleteContent(@Request() req: any, @Param('id') id: string) {
    return this.advocacyContentService.delete(req.user.workspaceId, id);
  }

  @Get('content/meta/categories')
  @ApiOperation({ summary: 'Get all content categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories(@Request() req: any) {
    return this.advocacyContentService.getCategories(req.user.workspaceId);
  }

  @Get('content/meta/tags')
  @ApiOperation({ summary: 'Get all content tags' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async getTags(@Request() req: any) {
    return this.advocacyContentService.getTags(req.user.workspaceId);
  }

  // Share Endpoints
  @Post('shares')
  @ApiOperation({ summary: 'Share content' })
  @ApiResponse({ status: 201, description: 'Content shared successfully' })
  async shareContent(@Request() req: any, @Body() dto: ShareContentDto) {
    const profile = await this.employeeProfileService.findByUserId(
      req.user.workspaceId,
      req.user.userId,
    );
    return this.employeeShareService.share(req.user.workspaceId, profile.id, dto);
  }

  @Get('shares')
  @ApiOperation({ summary: 'Get all shares' })
  @ApiResponse({ status: 200, description: 'Shares retrieved successfully' })
  async getShares(@Request() req: any, @Query() query: any) {
    return this.employeeShareService.findAll(req.user.workspaceId, query);
  }

  @Get('shares/me')
  @ApiOperation({ summary: 'Get current user shares' })
  @ApiResponse({ status: 200, description: 'Shares retrieved successfully' })
  async getMyShares(@Request() req: any) {
    const profile = await this.employeeProfileService.findByUserId(
      req.user.workspaceId,
      req.user.userId,
    );
    return this.employeeShareService.getEmployeeShares(req.user.workspaceId, profile.id);
  }

  @Get('shares/:id')
  @ApiOperation({ summary: 'Get share by ID' })
  @ApiResponse({ status: 200, description: 'Share retrieved successfully' })
  async getShare(@Request() req: any, @Param('id') id: string) {
    return this.employeeShareService.findOne(req.user.workspaceId, id);
  }

  // Gamification Endpoints
  @Get('badges/me')
  @ApiOperation({ summary: 'Get current user badges' })
  @ApiResponse({ status: 200, description: 'Badges retrieved successfully' })
  async getMyBadges(@Request() req: any) {
    const profile = await this.employeeProfileService.findByUserId(
      req.user.workspaceId,
      req.user.userId,
    );
    return this.gamificationService.getEmployeeBadges(profile.id);
  }

  @Get('badges/progress')
  @ApiOperation({ summary: 'Get badge progress' })
  @ApiResponse({ status: 200, description: 'Badge progress retrieved successfully' })
  async getBadgeProgress(@Request() req: any) {
    const profile = await this.employeeProfileService.findByUserId(
      req.user.workspaceId,
      req.user.userId,
    );
    return this.gamificationService.getBadgeProgress(profile.id);
  }

  // Leaderboard Endpoints
  @Get('leaderboard/:period')
  @ApiOperation({ summary: 'Get leaderboard for period' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  async getLeaderboard(@Request() req: any, @Param('period') period: string) {
    return this.leaderboardService.getLeaderboard(req.user.workspaceId, period as any);
  }

  @Get('leaderboard/:period/me')
  @ApiOperation({ summary: 'Get current user rank' })
  @ApiResponse({ status: 200, description: 'Rank retrieved successfully' })
  async getMyRank(@Request() req: any, @Param('period') period: string) {
    const profile = await this.employeeProfileService.findByUserId(
      req.user.workspaceId,
      req.user.userId,
    );
    if (!profile) {
      throw new Error('Employee profile not found');
    }
    return this.leaderboardService.getEmployeeRank(req.user.workspaceId, profile.id, period);
  }

  @Get('leaderboard/:period/top')
  @ApiOperation({ summary: 'Get top performers' })
  @ApiResponse({ status: 200, description: 'Top performers retrieved successfully' })
  async getTopPerformers(
    @Request() req: any,
    @Param('period') period: string,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getTopPerformers(
      req.user.workspaceId,
      period,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  // Content Suggestions Endpoints
  @Post('suggestions/generate')
  @ApiOperation({ summary: 'Generate content suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions generated successfully' })
  async generateSuggestions(@Request() req: any) {
    const profile = await this.employeeProfileService.findByUserId(
      req.user.workspaceId,
      req.user.userId,
    );
    if (!profile) {
      throw new Error('Employee profile not found');
    }
    return this.contentSuggestionService.generateSuggestions(profile.id);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get content suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions retrieved successfully' })
  async getSuggestions(@Request() req: any, @Query('status') status?: string) {
    const profile = await this.employeeProfileService.findByUserId(
      req.user.workspaceId,
      req.user.userId,
    );
    if (!profile) {
      throw new Error('Employee profile not found');
    }
    return this.contentSuggestionService.getSuggestions(profile.id, status);
  }

  @Post('suggestions/:id/viewed')
  @ApiOperation({ summary: 'Mark suggestion as viewed' })
  @ApiResponse({ status: 200, description: 'Suggestion marked as viewed' })
  async markSuggestionViewed(@Param('id') id: string) {
    return this.contentSuggestionService.markViewed(id);
  }

  @Post('suggestions/:id/dismissed')
  @ApiOperation({ summary: 'Dismiss suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion dismissed' })
  async dismissSuggestion(@Param('id') id: string) {
    return this.contentSuggestionService.markDismissed(id);
  }

  // Settings Endpoints
  @Get('settings')
  @ApiOperation({ summary: 'Get advocacy settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getSettings(@Request() req: any) {
    return this.advocacySettingsService.getSettings(req.user.workspaceId);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update advocacy settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Request() req: any, @Body() dto: UpdateAdvocacySettingsDto) {
    return this.advocacySettingsService.updateSettings(req.user.workspaceId, dto);
  }
}
