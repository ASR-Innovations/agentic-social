import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ZapierService } from '../services/zapier.service';
import { ApiKeyService } from '../services/api-key.service';

@ApiTags('zapier')
@Controller('api/zapier')
export class ZapierController {
  constructor(
    private zapierService: ZapierService,
    private apiKeyService: ApiKeyService,
  ) {}

  // ============================================
  // Zapier Authentication
  // ============================================

  @Post('auth/test')
  @ApiOperation({ summary: 'Test Zapier authentication' })
  @ApiHeader({ name: 'X-API-Key', required: true })
  async testAuth(@Headers('x-api-key') apiKey: string) {
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    return this.zapierService.authenticate(apiKey);
  }

  // ============================================
  // Zapier Triggers
  // ============================================

  @Get('triggers')
  @ApiOperation({ summary: 'Get list of available Zapier triggers' })
  async getTriggers() {
    return this.zapierService.getAvailableTriggers();
  }

  @Post('triggers/:triggerKey/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to a Zapier trigger' })
  async subscribeTrigger(
    @Request() req: any,
    @Param('triggerKey') triggerKey: string,
    @Body('targetUrl') targetUrl: string,
    @Body('subscriptionId') subscriptionId?: string,
  ) {
    return this.zapierService.subscribeTrigger(
      req.user.workspaceId,
      req.user.userId,
      triggerKey,
      targetUrl,
      subscriptionId,
    );
  }

  @Delete('triggers/:triggerKey/unsubscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from a Zapier trigger' })
  async unsubscribeTrigger(
    @Request() req: any,
    @Param('triggerKey') triggerKey: string,
    @Query('subscriptionId') subscriptionId?: string,
  ) {
    return this.zapierService.unsubscribeTrigger(
      req.user.workspaceId,
      triggerKey,
      subscriptionId,
    );
  }

  @Get('triggers/:triggerKey/sample')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sample data for a trigger' })
  async getTriggerSample(
    @Request() req: any,
    @Param('triggerKey') triggerKey: string,
  ) {
    return this.zapierService.getTriggerSample(triggerKey, req.user.workspaceId);
  }

  @Post('triggers/:triggerKey/test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test a trigger by sending sample data' })
  async testTrigger(
    @Request() req: any,
    @Param('triggerKey') triggerKey: string,
  ) {
    const sampleData = await this.zapierService.getTriggerSample(
      triggerKey,
      req.user.workspaceId,
    );

    await this.zapierService.triggerWebhook(
      req.user.workspaceId,
      triggerKey,
      sampleData,
    );

    return {
      message: 'Test trigger sent successfully',
      data: sampleData,
    };
  }

  // ============================================
  // Zapier Actions
  // ============================================

  @Get('actions')
  @ApiOperation({ summary: 'Get list of available Zapier actions' })
  async getActions() {
    return this.zapierService.getAvailableActions();
  }

  @Post('actions/create-post')
  @ApiOperation({ summary: 'Create a post via Zapier' })
  @ApiHeader({ name: 'X-API-Key', required: true })
  async createPost(
    @Headers('x-api-key') apiKey: string,
    @Body() data: any,
  ) {
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Authenticate and get workspace
    const auth = await this.zapierService.authenticate(apiKey);
    
    return this.zapierService.createPost(
      auth.workspace.id,
      'zapier', // Use 'zapier' as the user ID for Zapier actions
      data,
    );
  }

  @Post('actions/schedule-post')
  @ApiOperation({ summary: 'Schedule a post via Zapier' })
  @ApiHeader({ name: 'X-API-Key', required: true })
  async schedulePost(
    @Headers('x-api-key') apiKey: string,
    @Body() data: any,
  ) {
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Authenticate and get workspace
    const auth = await this.zapierService.authenticate(apiKey);
    
    return this.zapierService.schedulePost(
      auth.workspace.id,
      'zapier',
      data,
    );
  }

  // ============================================
  // Zapier Webhook Endpoint (for receiving data from Zapier)
  // ============================================

  @Post('webhook')
  @ApiOperation({ summary: 'Receive webhook from Zapier' })
  async receiveWebhook(@Body() data: any) {
    // This endpoint can be used for bidirectional communication
    // For example, if Zapier needs to send data back to our platform
    return {
      received: true,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // Zapier App Configuration
  // ============================================

  @Get('config')
  @ApiOperation({ summary: 'Get Zapier app configuration' })
  async getConfig() {
    return {
      name: 'AI Social Media Platform',
      description: 'Automate your social media management with AI-powered tools',
      version: '1.0.0',
      authentication: {
        type: 'api_key',
        placement: 'header',
        key: 'X-API-Key',
        test: {
          url: '/api/zapier/auth/test',
          method: 'POST',
        },
      },
      triggers: this.zapierService.getAvailableTriggers(),
      actions: this.zapierService.getAvailableActions(),
    };
  }
}
