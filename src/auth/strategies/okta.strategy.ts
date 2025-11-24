import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { SSOService } from '../services/sso.service';
import { UserService } from '../../user/user.service';
import { SSOProvider } from '../dto/sso-config.dto';
import { UserRole } from '../../user/entities/user.entity';
import axios from 'axios';

@Injectable()
export class OktaStrategy extends PassportStrategy(Strategy, 'okta') {
  constructor(
    private configService: ConfigService,
    private ssoService: SSOService,
    private userService: UserService,
  ) {
    const oktaDomain = configService.get<string>('OKTA_DOMAIN');
    
    super({
      authorizationURL: `https://${oktaDomain}/oauth2/default/v1/authorize`,
      tokenURL: `https://${oktaDomain}/oauth2/default/v1/token`,
      clientID: configService.get<string>('OKTA_CLIENT_ID'),
      clientSecret: configService.get<string>('OKTA_CLIENT_SECRET'),
      callbackURL: configService.get<string>('OKTA_CALLBACK_URL'),
      scope: ['openid', 'email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    try {
      // Extract workspace ID from state parameter
      const state = req.query.state ? JSON.parse(Buffer.from(req.query.state, 'base64').toString()) : {};
      const workspaceId = state.workspaceId;

      if (!workspaceId) {
        throw new UnauthorizedException('Workspace ID is required');
      }

      // Verify SSO is enabled for this workspace
      const ssoConfig = await this.ssoService.getConfigByProvider(
        workspaceId,
        SSOProvider.OKTA,
      );

      if (!ssoConfig.enabled) {
        throw new UnauthorizedException('Okta SSO is not enabled for this workspace');
      }

      // Get user info from Okta
      const userInfoResponse = await axios.get(
        `https://${this.configService.get<string>('OKTA_DOMAIN')}/oauth2/default/v1/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const userInfo = userInfoResponse.data;
      const email = userInfo.email;
      const name = userInfo.name || email;
      const oktaId = userInfo.sub;

      if (!email) {
        throw new UnauthorizedException('Email not provided by Okta');
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
          ssoProvider: SSOProvider.OKTA,
          ssoProviderId: oktaId,
        });
      } else {
        // Update SSO information if not set
        if (!user.ssoProvider) {
          await this.userService.update(user.id, {
            ssoProvider: SSOProvider.OKTA,
            ssoProviderId: oktaId,
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
