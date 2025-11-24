import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        NODE_ENV: 'test',
      };
      return config[key];
    }),
  };

  const mockMongoConnection = {
    readyState: 1,
    db: {
      admin: jest.fn().mockReturnValue({
        ping: jest.fn().mockResolvedValue({}),
      }),
    },
  };

  const mockRedis = {
    ping: jest.fn().mockResolvedValue('PONG'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: 'default_MongooseModuleConnectionToken',
          useValue: mockMongoConnection,
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when all checks pass', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.check();

      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment', 'test');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('checks');
      expect(result.checks).toHaveProperty('database');
      expect(result.checks).toHaveProperty('redis');
      expect(result.checks).toHaveProperty('mongodb');
      expect(result.checks).toHaveProperty('disk');
      expect(result.checks).toHaveProperty('memory');
    });

    it('should return unhealthy status when database check fails', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.check();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.database.status).toBe('down');
      expect(result.checks.database.message).toBe('Database connection failed');
    });

    it('should return unhealthy status when redis check fails', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      mockRedis.ping.mockRejectedValue(new Error('Redis connection failed'));

      const result = await service.check();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.redis.status).toBe('down');
    });
  });

  describe('readiness', () => {
    it('should return ready status when all critical services are available', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.readiness();

      expect(result).toHaveProperty('status', 'ready');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('responseTime');
    });

    it('should return not ready status when database is unavailable', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Database unavailable'));

      const result = await service.readiness();

      expect(result.status).toBe('not ready');
      expect(result).toHaveProperty('error');
    });
  });

  describe('liveness', () => {
    it('should return alive status with process metrics', async () => {
      const result = await service.liveness();

      expect(result).toHaveProperty('status', 'alive');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
      expect(result.memory).toHaveProperty('rss');
      expect(result.memory).toHaveProperty('heapTotal');
      expect(result.memory).toHaveProperty('heapUsed');
      expect(result.memory).toHaveProperty('external');
      expect(result).toHaveProperty('cpu');
      expect(result.cpu).toHaveProperty('user');
      expect(result.cpu).toHaveProperty('system');
      expect(result).toHaveProperty('pid');
      expect(result).toHaveProperty('nodeVersion');
    });
  });
});
