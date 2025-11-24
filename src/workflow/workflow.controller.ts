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
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkflowService, DelegationService } from './services';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    workspaceId: string;
  };
}
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  StartWorkflowDto,
  ApproveWorkflowDto,
  BulkApproveDto,
  CreateDelegationDto,
  QueryWorkflowDto,
  QueryWorkflowInstanceDto,
  QueryApprovalDto,
} from './dto';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly delegationService: DelegationService,
  ) {}

  // ============================================
  // Workflow Management
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async createWorkflow(@Request() req: RequestWithUser, @Body() dto: CreateWorkflowDto) {
    return this.workflowService.createWorkflow(req.user.workspaceId, req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workflows' })
  @ApiResponse({ status: 200, description: 'Workflows retrieved successfully' })
  async listWorkflows(@Request() req: RequestWithUser, @Query() query: QueryWorkflowDto) {
    return this.workflowService.listWorkflows(req.user.workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiResponse({ status: 200, description: 'Workflow retrieved successfully' })
  async getWorkflow(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.workflowService.getWorkflow(req.user.workspaceId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully' })
  async updateWorkflow(@Request() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowService.updateWorkflow(req.user.workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully' })
  async deleteWorkflow(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.workflowService.deleteWorkflow(req.user.workspaceId, id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get workflow analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getWorkflowAnalytics(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.workflowService.getWorkflowAnalytics(req.user.workspaceId, id);
  }

  // ============================================
  // Workflow Instances
  // ============================================

  @Post('instances')
  @ApiOperation({ summary: 'Start a workflow instance' })
  @ApiResponse({ status: 201, description: 'Workflow instance started successfully' })
  async startWorkflow(@Request() req: RequestWithUser, @Body() dto: StartWorkflowDto) {
    return this.workflowService.startWorkflow(req.user.workspaceId, req.user.userId, dto);
  }

  @Get('instances')
  @ApiOperation({ summary: 'List workflow instances' })
  @ApiResponse({ status: 200, description: 'Workflow instances retrieved successfully' })
  async listWorkflowInstances(@Request() req: RequestWithUser, @Query() query: QueryWorkflowInstanceDto) {
    return this.workflowService.listWorkflowInstances(req.user.workspaceId, query);
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Get workflow instance by ID' })
  @ApiResponse({ status: 200, description: 'Workflow instance retrieved successfully' })
  async getWorkflowInstance(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.workflowService.getWorkflowInstance(req.user.workspaceId, id);
  }

  // ============================================
  // Approvals
  // ============================================

  @Get('approvals/pending')
  @ApiOperation({ summary: 'List pending approvals for current user' })
  @ApiResponse({ status: 200, description: 'Pending approvals retrieved successfully' })
  async listPendingApprovals(@Request() req: RequestWithUser, @Query() query: QueryApprovalDto) {
    return this.workflowService.listPendingApprovals(req.user.workspaceId, req.user.userId, query);
  }

  @Put('approvals/:id')
  @ApiOperation({ summary: 'Approve or reject a workflow step' })
  @ApiResponse({ status: 200, description: 'Approval processed successfully' })
  async approveWorkflow(@Request() req: RequestWithUser, @Param('id') id: string, @Body() dto: ApproveWorkflowDto) {
    return this.workflowService.approveWorkflow(req.user.workspaceId, id, req.user.userId, dto);
  }

  @Post('approvals/bulk')
  @ApiOperation({ summary: 'Bulk approve multiple approvals' })
  @ApiResponse({ status: 200, description: 'Bulk approval processed successfully' })
  async bulkApprove(@Request() req: RequestWithUser, @Body() dto: BulkApproveDto) {
    return this.workflowService.bulkApprove(req.user.workspaceId, req.user.userId, dto);
  }

  // ============================================
  // Delegations
  // ============================================

  @Post('delegations')
  @ApiOperation({ summary: 'Create a new delegation' })
  @ApiResponse({ status: 201, description: 'Delegation created successfully' })
  async createDelegation(@Request() req: RequestWithUser, @Body() dto: CreateDelegationDto) {
    return this.delegationService.createDelegation(req.user.workspaceId, req.user.userId, dto);
  }

  @Get('delegations')
  @ApiOperation({ summary: 'List delegations for current user' })
  @ApiResponse({ status: 200, description: 'Delegations retrieved successfully' })
  async listDelegations(@Request() req: RequestWithUser) {
    return this.delegationService.listDelegations(req.user.workspaceId, req.user.userId);
  }

  @Get('delegations/active')
  @ApiOperation({ summary: 'List active delegations for current user' })
  @ApiResponse({ status: 200, description: 'Active delegations retrieved successfully' })
  async listActiveDelegations(@Request() req: RequestWithUser) {
    return this.delegationService.listActiveDelegations(req.user.workspaceId, req.user.userId);
  }

  @Get('delegations/:id')
  @ApiOperation({ summary: 'Get delegation by ID' })
  @ApiResponse({ status: 200, description: 'Delegation retrieved successfully' })
  async getDelegation(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.delegationService.getDelegation(req.user.workspaceId, id);
  }

  @Put('delegations/:id')
  @ApiOperation({ summary: 'Update delegation' })
  @ApiResponse({ status: 200, description: 'Delegation updated successfully' })
  async updateDelegation(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: Partial<CreateDelegationDto>,
  ) {
    return this.delegationService.updateDelegation(req.user.workspaceId, id, req.user.userId, dto);
  }

  @Delete('delegations/:id')
  @ApiOperation({ summary: 'Cancel a delegation' })
  @ApiResponse({ status: 200, description: 'Delegation cancelled successfully' })
  async cancelDelegation(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.delegationService.cancelDelegation(req.user.workspaceId, id, req.user.userId);
  }

  // ============================================
  // Analytics
  // ============================================

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get workflow analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics overview retrieved successfully' })
  async getAnalyticsOverview(@Request() req: RequestWithUser) {
    return this.workflowService.getWorkflowAnalytics(req.user.workspaceId);
  }
}
