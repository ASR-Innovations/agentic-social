import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Patch,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AgentFlowService } from './agentflow.service';
import { CreateAgentDto, UpdateAgentDto, TestAgentDto } from './dto/create-agent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgentType } from './interfaces/agent.interface';

/**
 * AgentFlow Controller
 * 
 * REST API for managing AI agents.
 */
@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentFlowController {
  constructor(private readonly agentFlowService: AgentFlowService) {}

  /**
   * Create a new agent
   * POST /api/v1/agents
   */
  @Post()
  async create(@Request() req, @Body() createAgentDto: CreateAgentDto) {
    return this.agentFlowService.createAgent(req.user.tenantId, createAgentDto);
  }

  /**
   * Get all agents for tenant
   * GET /api/v1/agents
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('type') type?: AgentType,
    @Query('active') active?: string,
  ) {
    const filters: any = {};

    if (type) {
      filters.type = type;
    }

    if (active !== undefined) {
      filters.active = active === 'true';
    }

    return this.agentFlowService.findAll(req.user.tenantId, filters);
  }

  /**
   * Get agent statistics
   * GET /api/v1/agents/statistics
   */
  @Get('statistics')
  async getStatistics(@Request() req) {
    return this.agentFlowService.getStatistics(req.user.tenantId);
  }

  /**
   * Get a single agent
   * GET /api/v1/agents/:id
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.agentFlowService.findOne(req.user.tenantId, id);
  }

  /**
   * Update an agent
   * PATCH /api/v1/agents/:id
   */
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
  ) {
    return this.agentFlowService.update(req.user.tenantId, id, updateAgentDto);
  }

  /**
   * Delete an agent
   * DELETE /api/v1/agents/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req, @Param('id') id: string) {
    await this.agentFlowService.delete(req.user.tenantId, id);
  }

  /**
   * Activate an agent
   * POST /api/v1/agents/:id/activate
   */
  @Post(':id/activate')
  async activate(@Request() req, @Param('id') id: string) {
    return this.agentFlowService.setActive(req.user.tenantId, id, true);
  }

  /**
   * Deactivate an agent
   * POST /api/v1/agents/:id/deactivate
   */
  @Post(':id/deactivate')
  async deactivate(@Request() req, @Param('id') id: string) {
    return this.agentFlowService.setActive(req.user.tenantId, id, false);
  }

  /**
   * Test an agent
   * POST /api/v1/agents/:id/test
   */
  @Post(':id/test')
  async test(
    @Request() req,
    @Param('id') id: string,
    @Body() testDto: TestAgentDto,
  ) {
    // This would create a test task and execute it
    // For now, return a placeholder
    return {
      message: 'Agent test endpoint - implementation pending',
      agentId: id,
      prompt: testDto.prompt,
    };
  }
}
