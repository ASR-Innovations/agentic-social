import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAccount, SocialPlatform } from './entities/social-account.entity';
import { EncryptionService } from './services/encryption.service';
import { OAuthService } from './services/oauth.service';
import { PlatformClientFactory } from './services/platform-client.factory';

@Injectable()
export class SocialAccountService {
  private readonly logger = new Logger(SocialAccountService.name);

  constructor(
    @InjectRepository(SocialAccount)
    private socialAccountRepository: Repository<SocialAccount>,
    private encryptionService: EncryptionService,
    private oauthService: OAuthService,
    private platformClientFactory: PlatformClientFactory,
  ) {}

  /**
   * Get OAuth authorization URL for connecting an account
   */
  async getAuthUrl(tenantId: string, platform: SocialPlatform): Promise<{ url: string; state: string }> {
    if (!this.oauthService.isPlatformConfigured(platform)) {
      throw new BadRequestException(`Platform ${platform} is not configured`);
    }

    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({ tenantId, platform, timestamp: Date.now() })).toString('base64');

    const url = this.oauthService.getAuthUrl(platform, state);

    return { url, state };
  }

  /**
   * Connect a social account using OAuth code
   */
  async connectAccount(
    tenantId: string,
    platform: SocialPlatform,
    code: string,
    redirectUri?: string,
    metadata?: Record<string, any>,
  ): Promise<SocialAccount> {
    try {
      // Exchange code for tokens
      const tokenResponse = await this.oauthService.exchangeCodeForToken(platform, code, redirectUri);

      // Get platform client to fetch account info
      const client = this.platformClientFactory.getClient(platform);
      const accountInfo = await client.getAccountInfo(tokenResponse.accessToken);

      // Encrypt tokens
      const encryptedTokens = await this.encryptionService.encryptTokens({
        accessToken: tokenResponse.accessToken,
        tokenType: tokenResponse.tokenType,
        scope: tokenResponse.scope,
        ...tokenResponse.metadata,
      });

      const encryptedRefreshToken = tokenResponse.refreshToken
        ? await this.encryptionService.encrypt(tokenResponse.refreshToken)
        : null;

      // Calculate token expiration
      const tokenExpiresAt = tokenResponse.expiresIn
        ? new Date(Date.now() + tokenResponse.expiresIn * 1000)
        : null;

      // Check if account already exists
      const existingAccount = await this.socialAccountRepository.findOne({
        where: {
          tenantId,
          platform,
          accountIdentifier: accountInfo.accountId,
        },
      });

      if (existingAccount) {
        // Update existing account
        existingAccount.displayName = accountInfo.displayName;
        existingAccount.oauthTokensEncrypted = encryptedTokens;
        existingAccount.refreshTokenEncrypted = encryptedRefreshToken;
        existingAccount.tokenExpiresAt = tokenExpiresAt;
        existingAccount.accountMetadata = {
          ...existingAccount.accountMetadata,
          ...accountInfo.metadata,
          ...metadata,
        };
        existingAccount.status = 'active';
        existingAccount.lastSyncAt = new Date();

        return await this.socialAccountRepository.save(existingAccount);
      }

      // Create new account
      const socialAccount = this.socialAccountRepository.create({
        tenantId,
        platform,
        accountIdentifier: accountInfo.accountId,
        displayName: accountInfo.displayName,
        oauthTokensEncrypted: encryptedTokens,
        refreshTokenEncrypted: encryptedRefreshToken,
        tokenExpiresAt,
        accountMetadata: {
          ...accountInfo.metadata,
          ...metadata,
        },
        status: 'active',
        lastSyncAt: new Date(),
      });

      return await this.socialAccountRepository.save(socialAccount);
    } catch (error) {
      this.logger.error(`Failed to connect ${platform} account: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to connect ${platform} account: ${error.message}`);
    }
  }

  /**
   * Disconnect (remove) a social account
   */
  async disconnectAccount(tenantId: string, accountId: string): Promise<void> {
    const account = await this.socialAccountRepository.findOne({
      where: { id: accountId, tenantId },
    });

    if (!account) {
      throw new NotFoundException('Social account not found');
    }

    await this.socialAccountRepository.remove(account);
  }

  /**
   * Get all social accounts for a tenant
   */
  async findAll(tenantId: string, platform?: SocialPlatform): Promise<SocialAccount[]> {
    const where: any = { tenantId };
    if (platform) {
      where.platform = platform;
    }

    return await this.socialAccountRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  /**
   * Get a single social account
   */
  async findOne(tenantId: string, accountId: string): Promise<SocialAccount> {
    const account = await this.socialAccountRepository.findOne({
      where: { id: accountId, tenantId },
    });

    if (!account) {
      throw new NotFoundException('Social account not found');
    }

    return account;
  }

  /**
   * Refresh access token for an account
   */
  async refreshAccountToken(tenantId: string, accountId: string): Promise<SocialAccount> {
    const account = await this.findOne(tenantId, accountId);

    if (!account.refreshTokenEncrypted) {
      throw new BadRequestException('No refresh token available for this account');
    }

    try {
      // Decrypt refresh token
      const refreshToken = await this.encryptionService.decrypt(account.refreshTokenEncrypted);

      // Request new tokens
      const tokenResponse = await this.oauthService.refreshToken(account.platform, refreshToken);

      // Encrypt new tokens
      const encryptedTokens = await this.encryptionService.encryptTokens({
        accessToken: tokenResponse.accessToken,
        tokenType: tokenResponse.tokenType,
        scope: tokenResponse.scope,
        ...tokenResponse.metadata,
      });

      const encryptedRefreshToken = tokenResponse.refreshToken
        ? await this.encryptionService.encrypt(tokenResponse.refreshToken)
        : account.refreshTokenEncrypted;

      // Calculate token expiration
      const tokenExpiresAt = tokenResponse.expiresIn
        ? new Date(Date.now() + tokenResponse.expiresIn * 1000)
        : null;

      // Update account
      account.oauthTokensEncrypted = encryptedTokens;
      account.refreshTokenEncrypted = encryptedRefreshToken;
      account.tokenExpiresAt = tokenExpiresAt;
      account.lastSyncAt = new Date();

      return await this.socialAccountRepository.save(account);
    } catch (error) {
      this.logger.error(`Failed to refresh token for account ${accountId}: ${error.message}`, error.stack);
      // Mark account as failed
      account.status = 'token_expired';
      await this.socialAccountRepository.save(account);
      throw new BadRequestException(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Get decrypted access token for an account
   */
  async getAccessToken(tenantId: string, accountId: string): Promise<string> {
    const account = await this.findOne(tenantId, accountId);

    // Check if token is expired
    if (account.tokenExpiresAt && account.tokenExpiresAt < new Date()) {
      // Try to refresh
      if (account.refreshTokenEncrypted) {
        await this.refreshAccountToken(tenantId, accountId);
        // Fetch updated account
        const refreshedAccount = await this.findOne(tenantId, accountId);
        const tokens = await this.encryptionService.decryptTokens(refreshedAccount.oauthTokensEncrypted);
        return tokens.accessToken;
      }
      throw new BadRequestException('Access token expired and no refresh token available');
    }

    const tokens = await this.encryptionService.decryptTokens(account.oauthTokensEncrypted);
    return tokens.accessToken;
  }

  /**
   * Sync account information from platform
   */
  async syncAccount(tenantId: string, accountId: string): Promise<SocialAccount> {
    const account = await this.findOne(tenantId, accountId);
    const accessToken = await this.getAccessToken(tenantId, accountId);

    try {
      const client = this.platformClientFactory.getClient(account.platform);
      const accountInfo = await client.getAccountInfo(accessToken);

      account.displayName = accountInfo.displayName;
      account.accountMetadata = {
        ...account.accountMetadata,
        ...accountInfo.metadata,
      };
      account.lastSyncAt = new Date();
      account.status = 'active';

      return await this.socialAccountRepository.save(account);
    } catch (error) {
      this.logger.error(`Failed to sync account ${accountId}: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to sync account: ${error.message}`);
    }
  }

  /**
   * Get configured platforms
   */
  getConfiguredPlatforms(): SocialPlatform[] {
    return this.oauthService.getConfiguredPlatforms();
  }

  /**
   * Check account health (token validity)
   */
  async checkAccountHealth(tenantId: string, accountId: string): Promise<{ healthy: boolean; message: string }> {
    try {
      const account = await this.findOne(tenantId, accountId);

      if (account.status !== 'active') {
        return { healthy: false, message: `Account status: ${account.status}` };
      }

      // Try to get access token (will refresh if needed)
      await this.getAccessToken(tenantId, accountId);

      return { healthy: true, message: 'Account is healthy' };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }
}
