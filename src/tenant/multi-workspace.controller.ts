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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MultiWorkspaceService } from './multi-workspace.service';
import { WorkspaceSwitchDto } from './dto/workspace-switch.dto';
import {
  CreateWorkspaceTemplateDto,
  ApplyWorkspaceTemplateDto,
} from './dto/workspace-template.dto';
import {
  CreateClientPortalAccessDto,
  UpdateClientPortalAccessDto,
} from './dto/client-portal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Multi-Workspace Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/workspaces')
export class MultiWorkspaceController {
  constructor(private readonly multiWorkspaceService: MultiWorkspaceService) {}

  @Get('my-workspaces')
  @ApiOperation({ summary: 'Get all workspaces accessible by current user' })
  @ApiResponse({
    status: 200,
    description: 'List of accessible workspaces',
  })
  async getMyWorkspaces(@Request() req: any) {
    return this.multiWorkspaceService.getUserWorkspaces(req.user.id);
  }

  @Post('switch')
  @ApiOperation({ summary: 'Switch to a different workspace' })
  @ApiResponse({
    status: 200,
    description: 'Successfully switched workspace',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have access to this workspace',
  })
  async switchWorkspace(@Request() req: any, @Body() dto: WorkspaceSwitchDto) {
    return this.multiWorkspaceService.switchWorkspace(
      req.user.id,
      dto.workspaceId,
    );
  }

  @Get('analytics/cross-workspace')
  @ApiOperation({ summary: 'Get cross-workspace analytics for agency dashboard' })
  @ApiQuery({
    name: 'workspaceIds',
    required: false,
    type: [String],
    description: 'Optional array of workspace IDs to filter',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for analytics (ISO 8601 format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for analytics (ISO 8601 format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cross-workspace analytics data',
  })
  async getCrossWorkspaceAnalytics(
    @Request() req: any,
    @Query('workspaceIds') workspaceIds?: string[],
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : undefined;

    return this.multiWorkspaceService.getCrossWorkspaceAnalytics(
      req.user.id,
      workspaceIds,
      dateRange,
    );
  }

  @Get('agency-dashboard')
  @ApiOperation({ summary: 'Get agency dashboard with all workspace data' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for analytics (ISO 8601 format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for analytics (ISO 8601 format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Agency dashboard data',
  })
  async getAgencyDashboard(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : undefined;

    return this.multiWorkspaceService.getAgencyDashboard(req.user.id, dateRange);
  }

  // Workspace Templates

  @Post('templates')
  @ApiOperation({ summary: 'Create a new workspace template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
  })
  async createTemplate(
    @Request() req: any,
    @Body() dto: CreateWorkspaceTemplateDto,
  ) {
    return this.multiWorkspaceService.createTemplate(dto, req.user.id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all available workspace templates' })
  @ApiResponse({
    status: 200,
    description: 'List of available templates',
  })
  async getTemplates(@Request() req: any) {
    return this.multiWorkspaceService.getTemplates(req.user.id);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a specific workspace template' })
  @ApiResponse({
    status: 200,
    description: 'Template details',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  async getTemplate(@Param('id') id: string) {
    return this.multiWorkspaceService.getTemplate(id);
  }

  @Post('templates/apply')
  @ApiOperation({ summary: 'Apply a template to a workspace' })
  @ApiResponse({
    status: 200,
    description: 'Template applied successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to modify this workspace',
  })
  async applyTemplate(@Request() req: any, @Body() dto: ApplyWorkspaceTemplateDto) {
    return this.multiWorkspaceService.applyTemplate(dto, req.user.id);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete a workspace template' })
  @ApiResponse({
    status: 200,
    description: 'Template deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to delete this template',
  })
  async deleteTemplate(@Request() req: any, @Param('id') id: string) {
    await this.multiWorkspaceService.deleteTemplate(id, req.user.id);
    return { message: 'Template deleted successfully' };
  }

  // Client Portal Access

  @Post(':workspaceId/client-portal')
  @ApiOperation({ summary: 'Create client portal access for a workspace' })
  @ApiResponse({
    status: 201,
    description: 'Client portal access created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Client already has access to this workspace',
  })
  async createClientPortalAccess(@Body() dto: CreateClientPortalAccessDto) {
    return this.multiWorkspaceService.createClientPortalAccess(dto);
  }

  @Get(':workspaceId/client-portal')
  @ApiOperation({ summary: 'Get all client portal accesses for a workspace' })
  @ApiResponse({
    status: 200,
    description: 'List of client portal accesses',
  })
  async getClientPortalAccesses(@Param('workspaceId') workspaceId: string) {
    return this.multiWorkspaceService.getClientPortalAccesses(workspaceId);
  }

  @Put('client-portal/:accessId')
  @ApiOperation({ summary: 'Update client portal access' })
  @ApiResponse({
    status: 200,
    description: 'Client portal access updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Client portal access not found',
  })
  async updateClientPortalAccess(
    @Param('accessId') accessId: string,
    @Body() dto: UpdateClientPortalAccessDto,
  ) {
    return this.multiWorkspaceService.updateClientPortalAccess(accessId, dto);
  }

  @Delete('client-portal/:accessId')
  @ApiOperation({ summary: 'Revoke client portal access' })
  @ApiResponse({
    status: 200,
    description: 'Client portal access revoked successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Client portal access not found',
  })
  async revokeClientPortalAccess(@Param('accessId') accessId: string) {
    await this.multiWorkspaceService.revokeClientPortalAccess(accessId);
    return { message: 'Client portal access revoked successfully' };
  }

  @Get('client-portal/verify/:token')
  @ApiOperation({ summary: 'Verify client portal access token' })
  @ApiResponse({
    status: 200,
    description: 'Token verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async verifyClientPortalToken(@Param('token') token: string) {
    return this.multiWorkspaceService.verifyClientPortalToken(token);
  }
}
