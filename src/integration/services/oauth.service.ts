import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import axios from 'axios';

interface OAuthConfig {
  authorizationUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUri: string;
}

@Injectable()
export class OAuthService {
  constructor(private prisma: PrismaService) {}

  async initiateOAuth(integrationId: string, workspaceId: string, redirectUri: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, workspaceId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // Get OAuth configuration from integration config
    const oauthConfig = integration.config as any;
    if (!oauthConfig?.authorizationUrl) {
      throw new BadRequestException('Integration does not support OAuth');
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Generate code verifier for PKCE (if supported)
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    // Store state
    await this.prisma.integrationOAuthState.create({
      data: {
        integrationId,
        state,
        codeVerifier,
        redirectUri,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Build authorization URL
    const authUrl = new URL(oauthConfig.authorizationUrl);
    authUrl.searchParams.append('client_id', oauthConfig.clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', (integration.scopes || []).join(' '));
    
    // Add PKCE if supported
    if (oauthConfig.supportsPKCE) {
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');
    }

    return {
      authorizationUrl: authUrl.toString(),
      state,
    };
  }

  async handleCallback(code: string, state: string) {
    // Verify state
    const oauthState = await this.prisma.integrationOAuthState.findUnique({
      where: { state },
      include: { integration: true },
    });

    if (!oauthState) {
      throw new BadRequestException('Invalid state parameter');
    }

    if (oauthState.expiresAt < new Date()) {
      throw new BadRequestException('State has expired');
    }

    const integration = oauthState.integration;
    const oauthConfig = integration.config as any;

    try {
      // Exchange code for tokens
      const tokenResponse = await axios.post(
        oauthConfig.tokenUrl,
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: oauthState.redirectUri,
          client_id: oauthConfig.clientId,
          client_secret: oauthConfig.clientSecret,
          code_verifier: oauthState.codeVerifier,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Encrypt and store tokens
      const encryptedCredentials = this.encryptCredentials({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
      });

      // Update integration with credentials
      await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          credentials: encryptedCredentials,
          status: 'ACTIVE',
          lastSyncedAt: new Date(),
        },
      });

      // Delete used state
      await this.prisma.integrationOAuthState.delete({
        where: { state },
      });

      return {
        success: true,
        integrationId: integration.id,
      };
    } catch (error: any) {
      // Log error
      await this.prisma.integrationLog.create({
        data: {
          integrationId: integration.id,
          action: 'oauth_callback',
          status: 'error',
          error: error.message,
        },
      });

      throw new BadRequestException('Failed to exchange authorization code');
    }
  }

  async refreshToken(integrationId: string) {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || !integration.credentials) {
      throw new NotFoundException('Integration not found or not configured');
    }

    const credentials = this.decryptCredentials(integration.credentials as any);
    const oauthConfig = integration.config as any;

    try {
      const tokenResponse = await axios.post(
        oauthConfig.tokenUrl,
        {
          grant_type: 'refresh_token',
          refresh_token: credentials.refreshToken,
          client_id: oauthConfig.clientId,
          client_secret: oauthConfig.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Encrypt and store new tokens
      const encryptedCredentials = this.encryptCredentials({
        accessToken: access_token,
        refreshToken: refresh_token || credentials.refreshToken, // Some providers don't return new refresh token
        expiresIn: expires_in,
      });

      // Update integration
      await this.prisma.integration.update({
        where: { id: integrationId },
        data: {
          credentials: encryptedCredentials,
          lastSyncedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error: any) {
      // Log error
      await this.prisma.integrationLog.create({
        data: {
          integrationId,
          action: 'token_refresh',
          status: 'error',
          error: error.message,
        },
      });

      // Mark integration as error
      await this.prisma.integration.update({
        where: { id: integrationId },
        data: {
          status: 'ERROR',
          lastErrorAt: new Date(),
          lastError: 'Failed to refresh token',
        },
      });

      throw new BadRequestException('Failed to refresh token');
    }
  }

  private encryptCredentials(credentials: any): any {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8').slice(0, 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  private decryptCredentials(encryptedData: any): any {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8').slice(0, 32);
    
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(encryptedData.iv, 'hex'),
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
