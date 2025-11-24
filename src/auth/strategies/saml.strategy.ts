import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-saml';
import { SSOService } from '../services/sso.service';
import { UserService } from '../../user/user.service';
import { SSOProvider } from '../dto/sso-config.dto';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(
    private ssoService: SSOService,
    private userService: UserService,
  ) {
    super({
      passReqToCallback: true,
      // Dynamic configuration will be loaded per request
    });
  }

  async validate(req: any, profile: Profile): Promise<any> {
    try {
      // Extract workspace ID from request (could be from subdomain, query param, etc.)
      const workspaceId = req.query.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        throw new UnauthorizedException('Workspace ID is required');
      }

      // Get SSO configuration
      const ssoConfig = await this.ssoService.getConfigByProvider(
        workspaceId,
        SSOProvider.SAML,
      );

      if (!ssoConfig.enabled) {
        throw new UnauthorizedException('SAML SSO is not enabled for this workspace');
      }

      // Extract user information from SAML profile
      const email = profile.email || profile.nameID;
      const name = (profile.displayName || profile.name || email) as string;

      if (!email) {
        throw new UnauthorizedException('Email not provided by SAML provider');
      }

      // Find or create user
      let user = await this.userService.findByEmail(email);

      if (!user) {
        // Auto-provision user
        user = await this.userService.create({
          email,
          name,
          tenantId: workspaceId,
          role: UserRole.EDITOR, // Default role for SSO users
          ssoProvider: SSOProvider.SAML,
          ssoProviderId: profile.nameID,
        });
      } else {
        // Update SSO information if not set
        if (!user.ssoProvider) {
          await this.userService.update(user.id, {
            ssoProvider: SSOProvider.SAML,
            ssoProviderId: profile.nameID,
          });
        }
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
