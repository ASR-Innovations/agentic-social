import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../user/entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SSOService } from '../services/sso.service';
import { AuthService } from '../auth.service';
import { CreateSSOConfigDto, UpdateSSOConfigDto, SSOLoginDto, SSOProvider } from '../dto/sso-config.dto';
import { User } from '../../user/entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('auth/sso')
export class SSOController {
  constructor(
    private ssoService: SSOService,
    private authService: AuthService,
  ) {}

  // SSO Configuration Management (Admin only)
  @UseGuards(JwtAuthGuard)
  @Post('config')
  async createConfig(@Body() dto: CreateSSOConfigDto, @Request() req: RequestWithUser) {
    // Ensure user is admin
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Only admins can configure SSO');
    }

    return await this.ssoService.createConfig(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('config')
  async getConfig(@Request() req: RequestWithUser) {
    return await this.ssoService.getConfig(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('config')
  async updateConfig(@Body() dto: UpdateSSOConfigDto, @Request() req: RequestWithUser) {
    // Ensure user is admin
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Only admins can configure SSO');
    }

    return await this.ssoService.updateConfig(req.user.tenantId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('config')
  async deleteConfig(@Request() req: RequestWithUser) {
    // Ensure user is admin
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Only admins can configure SSO');
    }

    return await this.ssoService.deleteConfig(req.user.tenantId);
  }

  // SAML SSO Login Flow
  @Get('saml/login')
  @UseGuards(AuthGuard('saml'))
  async samlLogin(@Query('workspaceId') workspaceId: string) {
    // This route initiates SAML login
    // Passport will redirect to IdP
  }

  @Post('saml/callback')
  @UseGuards(AuthGuard('saml'))
  async samlCallback(@Request() req: RequestWithUser, @Res() res: Response) {
    // Generate JWT tokens
    const tokens = await this.authService['generateTokens'](req.user);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
    return res.redirect(redirectUrl);
  }

  // Google OAuth Login Flow
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Query('workspaceId') workspaceId: string) {
    // This route initiates Google OAuth login
    // Passport will redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Request() req: RequestWithUser, @Res() res: Response) {
    // Generate JWT tokens
    const tokens = await this.authService['generateTokens'](req.user);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
    return res.redirect(redirectUrl);
  }

  // Azure AD Login Flow
  @Get('azure/login')
  @UseGuards(AuthGuard('azure-ad'))
  async azureLogin(@Query('workspaceId') workspaceId: string) {
    // This route initiates Azure AD login
    // Passport will redirect to Azure AD
  }

  @Get('azure/callback')
  @UseGuards(AuthGuard('azure-ad'))
  async azureCallback(@Request() req: RequestWithUser, @Res() res: Response) {
    // Generate JWT tokens
    const tokens = await this.authService['generateTokens'](req.user);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
    return res.redirect(redirectUrl);
  }

  // Okta Login Flow
  @Get('okta/login')
  @UseGuards(AuthGuard('okta'))
  async oktaLogin(@Query('workspaceId') workspaceId: string) {
    // This route initiates Okta login
    // Passport will redirect to Okta
  }

  @Get('okta/callback')
  @UseGuards(AuthGuard('okta'))
  async oktaCallback(@Request() req: RequestWithUser, @Res() res: Response) {
    // Generate JWT tokens
    const tokens = await this.authService['generateTokens'](req.user);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`;
    return res.redirect(redirectUrl);
  }

  // Get available SSO providers for a workspace
  @Get('providers/:workspaceId')
  async getProviders(@Param('workspaceId') workspaceId: string) {
    try {
      const config = await this.ssoService.getConfig(workspaceId);
      return {
        provider: config.provider,
        enabled: config.enabled,
      };
    } catch (error) {
      return {
        provider: null,
        enabled: false,
      };
    }
  }
}
