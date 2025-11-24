import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WhiteLabelService } from '../services/white-label.service';
import {
  WhiteLabelConfigDto,
  UpdateWhiteLabelDto,
  WhiteLabelResponseDto,
} from '../dto/white-label-config.dto';

@ApiTags('White Label')
@Controller('white-label')
export class WhiteLabelController {
  constructor(private readonly whiteLabelService: WhiteLabelService) {}

  @Get(':workspaceId')
  @ApiOperation({ summary: 'Get white-label configuration for workspace' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'White-label configuration retrieved successfully',
    type: WhiteLabelConfigDto,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 400, description: 'White-label features not available for this plan' })
  async getWhiteLabelConfig(
    @Param('workspaceId') workspaceId: string,
  ): Promise<WhiteLabelConfigDto> {
    return this.whiteLabelService.getWhiteLabelConfig(workspaceId);
  }

  @Put(':workspaceId')
  @ApiOperation({ summary: 'Update white-label configuration' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'White-label configuration updated successfully',
    type: WhiteLabelConfigDto,
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 400, description: 'Invalid configuration or plan restriction' })
  async updateWhiteLabelConfig(
    @Param('workspaceId') workspaceId: string,
    @Body() updateDto: UpdateWhiteLabelDto,
  ): Promise<WhiteLabelConfigDto> {
    return this.whiteLabelService.updateWhiteLabelConfig(workspaceId, updateDto);
  }

  @Delete(':workspaceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset white-label configuration to defaults' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiResponse({ status: 204, description: 'White-label configuration reset successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async resetWhiteLabelConfig(@Param('workspaceId') workspaceId: string): Promise<void> {
    return this.whiteLabelService.resetWhiteLabelConfig(workspaceId);
  }

  @Get(':workspaceId/domain/verify')
  @ApiOperation({ summary: 'Verify custom domain DNS configuration' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'Domain verification result',
    schema: {
      type: 'object',
      properties: {
        verified: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No custom domain configured' })
  async verifyCustomDomain(
    @Param('workspaceId') workspaceId: string,
  ): Promise<{ verified: boolean; message: string }> {
    return this.whiteLabelService.verifyCustomDomain(workspaceId);
  }

  @Get(':workspaceId/domain/dns-records')
  @ApiOperation({ summary: 'Get DNS records required for custom domain setup' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace ID' })
  @ApiResponse({
    status: 200,
    description: 'DNS records for domain configuration',
    schema: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
  })
  @ApiResponse({ status: 400, description: 'No custom domain configured' })
  async getDnsRecords(
    @Param('workspaceId') workspaceId: string,
  ): Promise<Record<string, string>> {
    return this.whiteLabelService.getDnsRecords(workspaceId);
  }

  @Get('public/config')
  @ApiOperation({ summary: 'Get public white-label configuration by domain' })
  @ApiQuery({ name: 'domain', description: 'Custom domain name', required: true })
  @ApiResponse({
    status: 200,
    description: 'Public white-label configuration',
    type: WhiteLabelConfigDto,
  })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  async getPublicWhiteLabelConfig(
    @Query('domain') domain: string,
  ): Promise<WhiteLabelConfigDto | null> {
    return this.whiteLabelService.getPublicWhiteLabelConfig(domain);
  }
}
