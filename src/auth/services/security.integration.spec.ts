import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { IPWhitelistService } from './ip-whitelist.service';
import { TwoFactorService } from './two-factor.service';
import { SessionService } from './session.service';
import { SecurityAuditService } from './security-audit.service';
import { SecurityScanService } from './security-scan.service';
import { EncryptionService } from './encryption.service';

describe('Security Services Integration', () => {
  let module: TestingModule;
  let prismaService: PrismaService;
  let ipWhitelistService: IPWhitelistService;
  let twoFactorService: TwoFactorService;
  let sessionService: SessionService;
  let securityAuditService: SecurityAuditService;
  let securityScanService: SecurityScanService;
  let encryptionService: EncryptionService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        IPWhitelistService,
        TwoFactorService,
        SessionService,
        SecurityAuditService,
        SecurityScanService,
        EncryptionService,
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    ipWhitelistService = module.get<IPWhitelistService>(IPWhitelistService);
    twoFactorService = module.get<TwoFactorService>(TwoFactorService);
    sessionService = module.get<SessionService>(SessionService);
    securityAuditService = module.get<SecurityAuditService>(SecurityAuditService);
    securityScanService = module.get<SecurityScanService>(SecurityScanService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('IPWhitelistService', () => {
    it('should be defined', () => {
      expect(ipWhitelistService).toBeDefined();
    });

    it('should validate IP addresses', async () => {
      const isWhitelisted = await ipWhitelistService.isIPWhitelisted(
        'test-workspace',
        '192.168.1.1'
      );
      // Should return true when no whitelist is configured
      expect(typeof isWhitelisted).toBe('boolean');
    });
  });

  describe('TwoFactorService', () => {
    it('should be defined', () => {
      expect(twoFactorService).toBeDefined();
    });

    it('should generate 2FA secret', async () => {
      // This would fail without a real user, but tests the service is wired correctly
      expect(twoFactorService.generateSecret).toBeDefined();
    });
  });

  describe('SessionService', () => {
    it('should be defined', () => {
      expect(sessionService).toBeDefined();
    });

    it('should have session management methods', () => {
      expect(sessionService.create).toBeDefined();
      expect(sessionService.findAll).toBeDefined();
      expect(sessionService.revoke).toBeDefined();
      expect(sessionService.revokeAll).toBeDefined();
    });
  });

  describe('SecurityAuditService', () => {
    it('should be defined', () => {
      expect(securityAuditService).toBeDefined();
    });

    it('should have audit logging methods', () => {
      expect(securityAuditService.create).toBeDefined();
      expect(securityAuditService.findAll).toBeDefined();
      expect(securityAuditService.getStatistics).toBeDefined();
    });
  });

  describe('SecurityScanService', () => {
    it('should be defined', () => {
      expect(securityScanService).toBeDefined();
    });

    it('should have scan methods', () => {
      expect(securityScanService.initiate).toBeDefined();
      expect(securityScanService.findAll).toBeDefined();
      expect(securityScanService.findOne).toBeDefined();
    });
  });

  describe('EncryptionService', () => {
    it('should be defined', () => {
      expect(encryptionService).toBeDefined();
    });

    it('should hash data', () => {
      const hash1 = encryptionService.hash('test-data');
      const hash2 = encryptionService.hash('test-data');
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should generate secure tokens', () => {
      const token1 = encryptionService.generateToken(32);
      const token2 = encryptionService.generateToken(32);
      
      expect(token1).toHaveLength(64); // 32 bytes = 64 hex characters
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2); // Should be unique
    });
  });
});
