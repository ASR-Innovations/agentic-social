import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 16;
  private readonly tagLength = 16;

  /**
   * Encrypts sensitive data using AES-256-GCM
   * @param data The data to encrypt
   * @param secret The encryption secret (from env)
   * @returns Encrypted string with format: salt:iv:tag:encryptedData
   */
  async encrypt(data: string, secret?: string): Promise<string> {
    const encryptionSecret = secret || process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET;

    if (!encryptionSecret) {
      throw new Error('Encryption secret not configured');
    }

    // Generate random salt and IV
    const salt = randomBytes(this.saltLength);
    const iv = randomBytes(this.ivLength);

    // Derive key from secret using scrypt
    const key = (await scryptAsync(encryptionSecret, salt, this.keyLength)) as Buffer;

    // Create cipher
    const cipher = createCipheriv(this.algorithm, key, iv);

    // Encrypt the data
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final(),
    ]);

    // Get auth tag
    const tag = cipher.getAuthTag();

    // Combine salt, iv, tag, and encrypted data
    return [
      salt.toString('base64'),
      iv.toString('base64'),
      tag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }

  /**
   * Decrypts data encrypted with encrypt()
   * @param encryptedData The encrypted string with format: salt:iv:tag:encryptedData
   * @param secret The encryption secret (from env)
   * @returns Decrypted string
   */
  async decrypt(encryptedData: string, secret?: string): Promise<string> {
    const encryptionSecret = secret || process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET;

    if (!encryptionSecret) {
      throw new Error('Encryption secret not configured');
    }

    try {
      // Split the encrypted data
      const [saltB64, ivB64, tagB64, dataB64] = encryptedData.split(':');

      if (!saltB64 || !ivB64 || !tagB64 || !dataB64) {
        throw new Error('Invalid encrypted data format');
      }

      // Convert from base64
      const salt = Buffer.from(saltB64, 'base64');
      const iv = Buffer.from(ivB64, 'base64');
      const tag = Buffer.from(tagB64, 'base64');
      const encrypted = Buffer.from(dataB64, 'base64');

      // Derive key
      const key = (await scryptAsync(encryptionSecret, salt, this.keyLength)) as Buffer;

      // Create decipher
      const decipher = createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);

      // Decrypt
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypts OAuth tokens object
   */
  async encryptTokens(tokens: Record<string, any>): Promise<string> {
    return this.encrypt(JSON.stringify(tokens));
  }

  /**
   * Decrypts OAuth tokens object
   */
  async decryptTokens(encryptedTokens: string): Promise<Record<string, any>> {
    const decrypted = await this.decrypt(encryptedTokens);
    return JSON.parse(decrypted);
  }
}
