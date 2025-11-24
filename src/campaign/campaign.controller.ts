import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CampaignService } from './campaign.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  QueryCampaignsDto,
  CampaignAnalyticsQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Request() req, @Body() createCampaignDto: CreateCampaignDto) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.create(workspaceId, createCampaignDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns with filtering' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Request() req, @Query() query: QueryCampaignsDto) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Request() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.findOne(workspaceId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.update(workspaceId, id, updateCampaignDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 204, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete campaign with associated posts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Request() req, @Param('id') id: string) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.remove(workspaceId, id);
  }

  @Post(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Associate a post with a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 204, description: 'Post associated successfully' })
  @ApiResponse({ status: 404, description: 'Campaign or post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addPost(
    @Request() req,
    @Param('id') id: string,
    @Param('postId') postId: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.addPost(workspaceId, id, postId);
  }

  @Delete(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a post from a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 204, description: 'Post removed successfully' })
  @ApiResponse({ status: 404, description: 'Campaign or post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removePost(
    @Request() req,
    @Param('id') id: string,
    @Param('postId') postId: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.removePost(workspaceId, id, postId);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get campaign performance analytics' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Campaign analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAnalytics(
    @Request() req,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const workspaceId = req.user.workspaceId;
    return this.campaignService.getPerformance(workspaceId, id, startDate, endDate);
  }
}
