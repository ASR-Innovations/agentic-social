import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    service = new EncryptionService();
    process.env.ENCRYPTION_SECRET = 'test-secret-key-for-encryption-testing';
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const originalData = 'sensitive-data-123';

      const encrypted = await service.encrypt(originalData);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(originalData);
      expect(encrypted.split(':').length).toBe(4); // salt:iv:tag:encryptedData

      const decrypted = await service.decrypt(encrypted);
      expect(decrypted).toBe(originalData);
    });

    it('should handle special characters', async () => {
      const originalData = 'test@#$%^&*()_+-=[]{}|;:,.<>?/~`';

      const encrypted = await service.encrypt(originalData);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it('should handle unicode characters', async () => {
      const originalData = 'Hello 世界 🌍';

      const encrypted = await service.encrypt(originalData);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it('should produce different ciphertext for same data (random salt/iv)', async () => {
      const originalData = 'test-data';

      const encrypted1 = await service.encrypt(originalData);
      const encrypted2 = await service.encrypt(originalData);

      expect(encrypted1).not.toBe(encrypted2);

      const decrypted1 = await service.decrypt(encrypted1);
      const decrypted2 = await service.decrypt(encrypted2);

      expect(decrypted1).toBe(originalData);
      expect(decrypted2).toBe(originalData);
    });

    it('should throw error for invalid encrypted data', async () => {
      await expect(service.decrypt('invalid-encrypted-data')).rejects.toThrow();
    });

    it('should throw error for tampered data', async () => {
      const originalData = 'test-data';
      const encrypted = await service.encrypt(originalData);

      // Tamper with the encrypted data
      const parts = encrypted.split(':');
      parts[3] = 'tampered';
      const tampered = parts.join(':');

      await expect(service.decrypt(tampered)).rejects.toThrow();
    });
  });

  describe('encryptTokens and decryptTokens', () => {
    it('should encrypt and decrypt token objects', async () => {
      const tokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
        tokenType: 'Bearer',
      };

      const encrypted = await service.encryptTokens(tokens);
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');

      const decrypted = await service.decryptTokens(encrypted);
      expect(decrypted).toEqual(tokens);
    });

    it('should handle complex nested objects', async () => {
      const tokens = {
        accessToken: 'token',
        metadata: {
          userId: '123',
          scopes: ['read', 'write'],
          nested: {
            value: 'test',
          },
        },
      };

      const encrypted = await service.encryptTokens(tokens);
      const decrypted = await service.decryptTokens(encrypted);

      expect(decrypted).toEqual(tokens);
    });
  });

  describe('error handling', () => {
    it('should throw error if encryption secret not configured', async () => {
      delete process.env.ENCRYPTION_SECRET;
      delete process.env.JWT_SECRET;

      await expect(service.encrypt('test')).rejects.toThrow('Encryption secret not configured');
    });

    it('should use JWT_SECRET as fallback', async () => {
      delete process.env.ENCRYPTION_SECRET;
      process.env.JWT_SECRET = 'jwt-secret-key';

      const data = 'test-data';
      const encrypted = await service.encrypt(data);
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(data);
    });
  });
});
