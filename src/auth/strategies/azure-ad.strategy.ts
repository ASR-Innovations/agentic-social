import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BearerStrategy } from 'passport-azure-ad';
import { ConfigService } from '@nestjs/config';
import { SSOService } from '../services/sso.service';
import { UserService } from '../../user/user.service';
import { SSOProvider } from '../dto/sso-config.dto';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class AzureADStrategy extends PassportStrategy(BearerStrategy, 'azure-ad') {
  constructor(
    private configService: ConfigService,
    private ssoService: SSOService,
    private userService: UserService,
  ) {
    super({
      identityMetadata: `https://login.microsoftonline.com/${configService.get<string>('AZURE_TENANT_ID')}/v2.0/.well-known/openid-configuration`,
      clientID: configService.get<string>('AZURE_CLIENT_ID'),
      validateIssuer: true,
      passReqToCallback: true,
      loggingLevel: 'info',
      scope: ['email', 'profile', 'openid'],
    });
  }

  async validate(req: any, token: any, done: any): Promise<any> {
    try {
      // Extract workspace ID from request
      const workspaceId = req.query.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        throw new UnauthorizedException('Workspace ID is required');
      }

      // Verify SSO is enabled for this workspace
      const ssoConfig = await this.ssoService.getConfigByProvider(
        workspaceId,
        SSOProvider.AZURE_AD,
      );

      if (!ssoConfig.enabled) {
        throw new UnauthorizedException('Azure AD SSO is not enabled for this workspace');
      }

      // Extract user information from token
      const email = token.preferred_username || token.email || token.upn;
      const name = token.name || email;
      const azureId = token.oid || token.sub;

      if (!email) {
        throw new UnauthorizedException('Email not provided by Azure AD');
      }

      // Find or create user
      let user = await this.userService.findByEmail(email);

      if (!user) {
        // Auto-provision user
        user = await this.userService.create({
          email,
          name,
          tenantId: workspaceId,
          role: UserRole.EDITOR,
          ssoProvider: SSOProvider.AZURE_AD,
          ssoProviderId: azureId,
        });
      } else {
        // Update SSO information if not set
        if (!user.ssoProvider) {
          await this.userService.update(user.id, {
            ssoProvider: SSOProvider.AZURE_AD,
            ssoProviderId: azureId,
          });
        }
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
