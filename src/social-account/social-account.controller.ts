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
} from '@nestjs/common';
import { SocialAccountService } from './social-account.service';
import { ConnectAccountDto, DisconnectAccountDto, RefreshAccountDto } from './dto/connect-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialPlatform } from './entities/social-account.entity';

@Controller('social-accounts')
@UseGuards(JwtAuthGuard)
export class SocialAccountController {
  constructor(private readonly socialAccountService: SocialAccountService) {}

  /**
   * Get OAuth authorization URL for a platform
   * GET /api/v1/social-accounts/auth-url/:platform
   */
  @Get('auth-url/:platform')
  async getAuthUrl(@Request() req, @Param('platform') platform: SocialPlatform) {
    return this.socialAccountService.getAuthUrl(req.user.tenantId, platform);
  }

  /**
   * Connect a social account using OAuth code
   * POST /api/v1/social-accounts/connect
   */
  @Post('connect')
  async connectAccount(@Request() req, @Body() connectDto: ConnectAccountDto) {
    const account = await this.socialAccountService.connectAccount(
      req.user.tenantId,
      connectDto.platform,
      connectDto.code,
      connectDto.redirectUri,
      connectDto.metadata,
    );

    // Remove sensitive data before returning
    return this.sanitizeAccount(account);
  }

  /**
   * Get all connected social accounts
   * GET /api/v1/social-accounts
   */
  @Get()
  async findAll(@Request() req, @Query('platform') platform?: SocialPlatform) {
    const accounts = await this.socialAccountService.findAll(req.user.tenantId, platform);
    return accounts.map((account) => this.sanitizeAccount(account));
  }

  /**
   * Get a single social account
   * GET /api/v1/social-accounts/:id
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const account = await this.socialAccountService.findOne(req.user.tenantId, id);
    return this.sanitizeAccount(account);
  }

  /**
   * Disconnect a social account
   * DELETE /api/v1/social-accounts/:id
   */
  @Delete(':id')
  async disconnectAccount(@Request() req, @Param('id') id: string) {
    await this.socialAccountService.disconnectAccount(req.user.tenantId, id);
    return { message: 'Account disconnected successfully' };
  }

  /**
   * Refresh access token for an account
   * POST /api/v1/social-accounts/:id/refresh
   */
  @Post(':id/refresh')
  async refreshToken(@Request() req, @Param('id') id: string) {
    const account = await this.socialAccountService.refreshAccountToken(req.user.tenantId, id);
    return this.sanitizeAccount(account);
  }

  /**
   * Sync account information from platform
   * POST /api/v1/social-accounts/:id/sync
   */
  @Post(':id/sync')
  async syncAccount(@Request() req, @Param('id') id: string) {
    const account = await this.socialAccountService.syncAccount(req.user.tenantId, id);
    return this.sanitizeAccount(account);
  }

  /**
   * Check account health
   * GET /api/v1/social-accounts/:id/health
   */
  @Get(':id/health')
  async checkHealth(@Request() req, @Param('id') id: string) {
    return this.socialAccountService.checkAccountHealth(req.user.tenantId, id);
  }

  /**
   * Get configured platforms
   * GET /api/v1/social-accounts/platforms/configured
   */
  @Get('platforms/configured')
  getConfiguredPlatforms() {
    return {
      platforms: this.socialAccountService.getConfiguredPlatforms(),
    };
  }

  /**
   * Remove sensitive data from account object
   */
  private sanitizeAccount(account: any) {
    const { oauthTokensEncrypted, refreshTokenEncrypted, ...sanitized } = account;
    return sanitized;
  }
}
