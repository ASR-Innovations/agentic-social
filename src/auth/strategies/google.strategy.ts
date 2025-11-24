import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { SSOService } from '../services/sso.service';
import { UserService } from '../../user/user.service';
import { SSOProvider } from '../dto/sso-config.dto';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private ssoService: SSOService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
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
        SSOProvider.GOOGLE,
      );

      if (!ssoConfig.enabled) {
        throw new UnauthorizedException('Google SSO is not enabled for this workspace');
      }

      // Extract user information
      const { emails, displayName, photos, id } = profile;
      const email = emails[0].value;
      const name = displayName;
      const avatar = photos && photos[0] ? photos[0].value : undefined;

      // Find or create user
      let user = await this.userService.findByEmail(email);

      if (!user) {
        // Auto-provision user
        user = await this.userService.create({
          email,
          name,
          avatar,
          tenantId: workspaceId,
          role: UserRole.EDITOR,
          ssoProvider: SSOProvider.GOOGLE,
          ssoProviderId: id,
        });
      } else {
        // Update SSO information if not set
        if (!user.ssoProvider) {
          await this.userService.update(user.id, {
            ssoProvider: SSOProvider.GOOGLE,
            ssoProviderId: id,
            avatar: avatar || user.avatar,
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
