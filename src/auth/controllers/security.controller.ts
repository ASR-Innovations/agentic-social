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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IPWhitelistService } from '../services/ip-whitelist.service';
import { TwoFactorService } from '../services/two-factor.service';
import { SessionService } from '../services/session.service';
import { SecurityAuditService } from '../services/security-audit.service';
import { SecurityScanService } from '../services/security-scan.service';
import {
  CreateIPWhitelistDto,
  UpdateIPWhitelistDto,
} from '../dto/ip-whitelist.dto';
import {
  EnableTwoFactorDto,
  VerifyTwoFactorDto,
  DisableTwoFactorDto,
  RegenerateBackupCodesDto,
} from '../dto/two-factor.dto';
import {
  RevokeSessionDto,
  RevokeAllSessionsDto,
} from '../dto/session.dto';
import {
  QueryAuditLogsDto,
} from '../dto/security-audit.dto';
import {
  InitiateSecurityScanDto,
  QuerySecurityScansDto,
} from '../dto/security-scan.dto';

@ApiTags('Security')
@ApiBearerAuth()
@Controller('security')
@UseGuards(JwtAuthGuard)
export class SecurityController {
  constructor(
    private ipWhitelistService: IPWhitelistService,
    private twoFactorService: TwoFactorService,
    private sessionService: SessionService,
    private securityAuditService: SecurityAuditService,
    private securityScanService: SecurityScanService,
  ) {}

  // ============================================
  // IP Whitelist Endpoints
  // ============================================

  @Post('ip-whitelist')
  @ApiOperation({ summary: 'Add IP address to whitelist' })
  @ApiResponse({ status: 201, description: 'IP address whitelisted successfully' })
  async createIPWhitelist(@Request() req, @Body() dto: CreateIPWhitelistDto) {
    return this.ipWhitelistService.create(
      req.user.workspaceId,
      req.user.userId,
      dto,
    );
  }

  @Get('ip-whitelist')
  @ApiOperation({ summary: 'Get all whitelisted IP addresses' })
  @ApiResponse({ status: 200, description: 'List of whitelisted IPs' })
  async getIPWhitelists(@Request() req) {
    return this.ipWhitelistService.findAll(req.user.workspaceId);
  }

  @Get('ip-whitelist/:id')
  @ApiOperation({ summary: 'Get specific whitelisted IP' })
  @ApiResponse({ status: 200, description: 'Whitelisted IP details' })
  async getIPWhitelist(@Request() req, @Param('id') id: string) {
    return this.ipWhitelistService.findOne(id, req.user.workspaceId);
  }

  @Put('ip-whitelist/:id')
  @ApiOperation({ summary: 'Update whitelisted IP' })
  @ApiResponse({ status: 200, description: 'IP whitelist updated' })
  async updateIPWhitelist(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateIPWhitelistDto,
  ) {
    return this.ipWhitelistService.update(id, req.user.workspaceId, dto);
  }

  @Delete('ip-whitelist/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove IP from whitelist' })
  @ApiResponse({ status: 204, description: 'IP removed from whitelist' })
  async deleteIPWhitelist(@Request() req, @Param('id') id: string) {
    await this.ipWhitelistService.remove(id, req.user.workspaceId);
  }

  // ============================================
  // Two-Factor Authentication Endpoints
  // ============================================

  @Post('2fa/setup')
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  @ApiResponse({ status: 200, description: '2FA setup initiated' })
  async setup2FA(@Request() req) {
    return this.twoFactorService.generateSecret(req.user.userId);
  }

  @Post('2fa/enable')
  @ApiOperation({ summary: 'Enable 2FA with verification token' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async enable2FA(@Request() req, @Body() dto: EnableTwoFactorDto) {
    // Secret should be passed from setup step (stored temporarily in session/state)
    const secret = req.body.secret; // This would come from the setup step
    return this.twoFactorService.enable(req.user.userId, dto.token, secret);
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify 2FA token' })
  @ApiResponse({ status: 200, description: 'Token verified' })
  async verify2FA(@Request() req, @Body() dto: VerifyTwoFactorDto) {
    const isValid = await this.twoFactorService.verify(req.user.userId, dto.token);
    return { valid: isValid };
  }

  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled' })
  async disable2FA(@Request() req, @Body() dto: DisableTwoFactorDto) {
    return this.twoFactorService.disable(
      req.user.userId,
      dto.password,
      dto.token,
    );
  }

  @Post('2fa/backup-codes/regenerate')
  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({ status: 200, description: 'Backup codes regenerated' })
  async regenerateBackupCodes(@Request() req, @Body() dto: RegenerateBackupCodesDto) {
    return this.twoFactorService.regenerateBackupCodes(req.user.userId, dto.token);
  }

  @Get('2fa/status')
  @ApiOperation({ summary: 'Check if 2FA is enabled' })
  @ApiResponse({ status: 200, description: '2FA status' })
  async get2FAStatus(@Request() req) {
    const enabled = await this.twoFactorService.isEnabled(req.user.userId);
    return { enabled };
  }

  // ============================================
  // Session Management Endpoints
  // ============================================

  @Get('sessions')
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  async getSessions(@Request() req) {
    return this.sessionService.findAll(req.user.userId);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke specific session' })
  @ApiResponse({ status: 204, description: 'Session revoked' })
  async revokeSession(@Request() req, @Param('id') id: string) {
    await this.sessionService.revoke(id, req.user.userId);
  }

  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke all sessions except current' })
  @ApiResponse({ status: 204, description: 'All sessions revoked' })
  async revokeAllSessions(@Request() req, @Body() dto: RevokeAllSessionsDto) {
    const currentToken = req.headers.authorization?.replace('Bearer ', '');
    await this.sessionService.revokeAll(
      req.user.userId,
      dto.keepCurrent ? currentToken : undefined,
    );
  }

  // ============================================
  // Security Audit Log Endpoints
  // ============================================

  @Get('audit-logs')
  @ApiOperation({ summary: 'Query security audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async getAuditLogs(@Request() req, @Query() query: QueryAuditLogsDto) {
    return this.securityAuditService.findAll(req.user.workspaceId, query);
  }

  @Get('audit-logs/statistics')
  @ApiOperation({ summary: 'Get audit log statistics' })
  @ApiResponse({ status: 200, description: 'Audit statistics' })
  async getAuditStatistics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.securityAuditService.getStatistics(
      req.user.workspaceId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // ============================================
  // Security Scan Endpoints
  // ============================================

  @Post('scans')
  @ApiOperation({ summary: 'Initiate security scan' })
  @ApiResponse({ status: 201, description: 'Security scan initiated' })
  async initiateScan(@Request() req, @Body() dto: InitiateSecurityScanDto) {
    return this.securityScanService.initiate(req.user.workspaceId, dto);
  }

  @Get('scans')
  @ApiOperation({ summary: 'Get security scan results' })
  @ApiResponse({ status: 200, description: 'List of security scans' })
  async getScans(@Request() req, @Query() query: QuerySecurityScansDto) {
    return this.securityScanService.findAll(req.user.workspaceId, query);
  }

  @Get('scans/:id')
  @ApiOperation({ summary: 'Get specific scan result' })
  @ApiResponse({ status: 200, description: 'Scan result details' })
  async getScan(@Request() req, @Param('id') id: string) {
    return this.securityScanService.findOne(id, req.user.workspaceId);
  }
}
