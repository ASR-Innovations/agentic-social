import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32; // 256 bits
  private readonly IV_LENGTH = 16;
  private readonly AUTH_TAG_LENGTH = 16;
  private readonly MASTER_KEY: string;

  constructor(private prisma: PrismaService) {
    this.MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY || this.generateMasterKey();
  }

  /**
   * Encrypt data at rest using AES-256-GCM
   */
  async encrypt(data: string, workspaceId: string, keyType: string = 'data'): Promise<string> {
    // Get or create encryption key for workspace
    const key = await this.getOrCreateKey(workspaceId, keyType);

    // Decrypt the workspace key using master key
    const workspaceKey = this.decryptKey(key.encryptedKey);

    // Generate IV
    const iv = crypto.randomBytes(this.IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(this.ALGORITHM, workspaceKey, iv);

    // Encrypt data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine IV + encrypted data + auth tag
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  /**
   * Decrypt data at rest
   */
  async decrypt(encryptedData: string, workspaceId: string, keyType: string = 'data'): Promise<string> {
    // Get encryption key for workspace
    const key = await this.getActiveKey(workspaceId, keyType);
    if (!key) {
      throw new Error('Encryption key not found');
    }

    // Decrypt the workspace key using master key
    const workspaceKey = this.decryptKey(key.encryptedKey);

    // Parse encrypted data
    const [ivHex, encryptedHex, authTagHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv(this.ALGORITHM, workspaceKey, iv);
    decipher.setAuthTag(authTag);

    // Decrypt data
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Rotate encryption keys for a workspace
   */
  async rotateKey(workspaceId: string, keyType: string = 'data') {
    // Get current active key
    const currentKey = await this.getActiveKey(workspaceId, keyType);

    // Mark current key as inactive
    if (currentKey) {
      await this.prisma.encryptionKey.update({
        where: { id: currentKey.id },
        data: {
          isActive: false,
          rotatedAt: new Date(),
        },
      });
    }

    // Create new key
    const newVersion = currentKey ? currentKey.keyVersion + 1 : 1;
    return this.createKey(workspaceId, keyType, newVersion);
  }

  /**
   * Re-encrypt data with new key (for key rotation)
   */
  async reencrypt(
    encryptedData: string,
    workspaceId: string,
    oldKeyVersion: number,
    newKeyVersion: number,
    keyType: string = 'data'
  ): Promise<string> {
    // Get old key
    const oldKey = await this.prisma.encryptionKey.findFirst({
      where: {
        workspaceId,
        keyType,
        keyVersion: oldKeyVersion,
      },
    });

    if (!oldKey) {
      throw new Error('Old encryption key not found');
    }

    // Decrypt with old key
    const oldWorkspaceKey = this.decryptKey(oldKey.encryptedKey);
    const [ivHex, encryptedHex, authTagHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.ALGORITHM, oldWorkspaceKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Encrypt with new key
    return this.encrypt(decrypted, workspaceId, keyType);
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  private async getOrCreateKey(workspaceId: string, keyType: string) {
    let key = await this.getActiveKey(workspaceId, keyType);

    if (!key) {
      key = await this.createKey(workspaceId, keyType, 1);
    }

    return key;
  }

  private async getActiveKey(workspaceId: string, keyType: string) {
    return this.prisma.encryptionKey.findFirst({
      where: {
        workspaceId,
        keyType,
        isActive: true,
      },
    });
  }

  private async createKey(workspaceId: string, keyType: string, version: number) {
    // Generate new workspace-specific key
    const workspaceKey = crypto.randomBytes(this.KEY_LENGTH);

    // Encrypt workspace key with master key
    const encryptedKey = this.encryptKey(workspaceKey);

    return this.prisma.encryptionKey.create({
      data: {
        workspaceId,
        keyType,
        encryptedKey,
        keyVersion: version,
        isActive: true,
      },
    });
  }

  private encryptKey(key: Buffer): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      this.ALGORITHM,
      Buffer.from(this.MASTER_KEY, 'hex').slice(0, this.KEY_LENGTH),
      iv
    );

    let encrypted = cipher.update(key);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
  }

  private decryptKey(encryptedKey: string): Buffer {
    const [ivHex, encryptedHex, authTagHex] = encryptedKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      Buffer.from(this.MASTER_KEY, 'hex').slice(0, this.KEY_LENGTH),
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  private generateMasterKey(): string {
    // In production, this should be stored securely (e.g., AWS KMS, HashiCorp Vault)
    console.warn('WARNING: Using generated master key. Set MASTER_ENCRYPTION_KEY in production!');
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }
}
