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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    workspaceId: string;
  };
}
import { IntegrationService } from './services/integration.service';
import { WebhookService } from './services/webhook.service';
import { ApiKeyService } from './services/api-key.service';
import { OAuthService } from './services/oauth.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@ApiTags('integrations')
@Controller('api/integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationController {
  constructor(
    private integrationService: IntegrationService,
    private webhookService: WebhookService,
    private apiKeyService: ApiKeyService,
    private oauthService: OAuthService,
  ) {}

  // ============================================
  // Integration Management
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create a new integration' })
  async createIntegration(@Request() req: RequestWithUser, @Body() dto: CreateIntegrationDto) {
    return this.integrationService.create(req.user.workspaceId, req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all integrations' })
  @ApiQuery({ name: 'includePublic', required: false, type: Boolean })
  async getIntegrations(@Request() req: RequestWithUser, @Query('includePublic') includePublic?: string) {
    return this.integrationService.findAll(
      req.user.workspaceId,
      includePublic === 'true',
    );
  }

  @Get('marketplace')
  @ApiOperation({ summary: 'Get public integrations marketplace' })
  async getMarketplace() {
    return this.integrationService.getMarketplace();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by ID' })
  async getIntegration(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.integrationService.findOne(id, req.user.workspaceId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update integration' })
  async updateIntegration(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationService.update(id, req.user.workspaceId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete integration' })
  async deleteIntegration(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.integrationService.remove(id, req.user.workspaceId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update integration status' })
  async updateIntegrationStatus(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'ERROR',
  ) {
    return this.integrationService.updateStatus(id, req.user.workspaceId, status);
  }

  // ============================================
  // OAuth Flow
  // ============================================

  @Post(':id/oauth/initiate')
  @ApiOperation({ summary: 'Initiate OAuth flow for integration' })
  async initiateOAuth(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body('redirectUri') redirectUri: string,
  ) {
    return this.oauthService.initiateOAuth(id, req.user.workspaceId, redirectUri);
  }

  @Post('oauth/callback')
  @ApiOperation({ summary: 'Handle OAuth callback' })
  async handleOAuthCallback(@Body('code') code: string, @Body('state') state: string) {
    return this.oauthService.handleCallback(code, state);
  }

  @Post(':id/oauth/refresh')
  @ApiOperation({ summary: 'Refresh OAuth token' })
  async refreshOAuthToken(@Param('id') id: string) {
    return this.oauthService.refreshToken(id);
  }

  // ============================================
  // Webhooks
  // ============================================

  @Post('webhooks')
  @ApiOperation({ summary: 'Create a new webhook' })
  async createWebhook(@Request() req: RequestWithUser, @Body() dto: CreateWebhookDto) {
    return this.webhookService.create(req.user.workspaceId, req.user.userId, dto);
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'Get all webhooks' })
  async getWebhooks(@Request() req: RequestWithUser) {
    return this.webhookService.findAll(req.user.workspaceId);
  }

  @Get('webhooks/:id')
  @ApiOperation({ summary: 'Get webhook by ID' })
  async getWebhook(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.webhookService.findOne(id, req.user.workspaceId);
  }

  @Put('webhooks/:id')
  @ApiOperation({ summary: 'Update webhook' })
  async updateWebhook(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: Partial<CreateWebhookDto>,
  ) {
    return this.webhookService.update(id, req.user.workspaceId, dto);
  }

  @Delete('webhooks/:id')
  @ApiOperation({ summary: 'Delete webhook' })
  async deleteWebhook(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.webhookService.remove(id, req.user.workspaceId);
  }

  @Put('webhooks/:id/status')
  @ApiOperation({ summary: 'Update webhook status' })
  async updateWebhookStatus(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'INACTIVE' | 'FAILED',
  ) {
    return this.webhookService.updateStatus(id, req.user.workspaceId, status);
  }

  @Post('webhooks/:id/deliveries/:deliveryId/retry')
  @ApiOperation({ summary: 'Retry failed webhook delivery' })
  async retryWebhookDelivery(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.webhookService.retryDelivery(deliveryId, req.user.workspaceId);
  }

  // ============================================
  // API Keys
  // ============================================

  @Post('api-keys')
  @ApiOperation({ summary: 'Create a new API key' })
  async createApiKey(@Request() req: RequestWithUser, @Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(req.user.workspaceId, req.user.userId, dto);
  }

  @Get('api-keys')
  @ApiOperation({ summary: 'Get all API keys' })
  async getApiKeys(@Request() req: RequestWithUser) {
    return this.apiKeyService.findAll(req.user.workspaceId);
  }

  @Get('api-keys/:id')
  @ApiOperation({ summary: 'Get API key by ID' })
  async getApiKey(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.apiKeyService.findOne(id, req.user.workspaceId);
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Revoke API key' })
  async revokeApiKey(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.apiKeyService.revoke(id, req.user.workspaceId);
  }
}
