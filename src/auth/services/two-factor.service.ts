import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  private readonly ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  private readonly BACKUP_CODES_COUNT = 10;

  constructor(private prisma: PrismaService) {}

  async generateSecret(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `AI Social Platform (${user.email})`,
      issuer: 'AI Social Platform',
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
    };
  }

  async enable(userId: string, token: string, secret: string) {
    // Verify the token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification token');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Encrypt secret and backup codes
    const encryptedSecret = this.encrypt(secret);
    const encryptedBackupCodes = backupCodes.map(code => this.encrypt(code));

    // Check if 2FA already exists
    const existing = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (existing) {
      // Update existing
      await this.prisma.twoFactorAuth.update({
        where: { userId },
        data: {
          secret: encryptedSecret,
          backupCodes: encryptedBackupCodes,
          isEnabled: true,
          verifiedAt: new Date(),
        },
      });
    } else {
      // Create new
      await this.prisma.twoFactorAuth.create({
        data: {
          userId,
          secret: encryptedSecret,
          backupCodes: encryptedBackupCodes,
          isEnabled: true,
          verifiedAt: new Date(),
        },
      });
    }

    return {
      enabled: true,
      backupCodes, // Return unencrypted codes to user (only time they see them)
    };
  }

  async verify(userId: string, token: string): Promise<boolean> {
    const twoFactor = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactor || !twoFactor.isEnabled) {
      throw new NotFoundException('Two-factor authentication not enabled');
    }

    const secret = this.decrypt(twoFactor.secret);

    // Try TOTP token first
    const isValidTOTP = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (isValidTOTP) {
      return true;
    }

    // Try backup codes
    for (let i = 0; i < twoFactor.backupCodes.length; i++) {
      const backupCode = this.decrypt(twoFactor.backupCodes[i]);
      if (backupCode === token) {
        // Remove used backup code
        const updatedCodes = [...twoFactor.backupCodes];
        updatedCodes.splice(i, 1);
        
        await this.prisma.twoFactorAuth.update({
          where: { userId },
          data: { backupCodes: updatedCodes },
        });

        return true;
      }
    }

    return false;
  }

  async disable(userId: string, password: string, token: string) {
    // Verify password (would need to integrate with auth service)
    // For now, just verify the token

    const isValid = await this.verify(userId, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        isEnabled: false,
      },
    });

    return { disabled: true };
  }

  async regenerateBackupCodes(userId: string, token: string) {
    const isValid = await this.verify(userId, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    const backupCodes = this.generateBackupCodes();
    const encryptedBackupCodes = backupCodes.map(code => this.encrypt(code));

    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: { backupCodes: encryptedBackupCodes },
    });

    return { backupCodes };
  }

  async isEnabled(userId: string): Promise<boolean> {
    const twoFactor = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    return twoFactor?.isEnabled ?? false;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.ENCRYPTION_KEY, 'hex').slice(0, 32),
      iv
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.ENCRYPTION_KEY, 'hex').slice(0, 32),
      iv
    );
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
