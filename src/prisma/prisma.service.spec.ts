import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Mock the Prisma client methods
    service.$connect = jest.fn().mockResolvedValue(undefined);
    service.$disconnect = jest.fn().mockResolvedValue(undefined);
    service.$queryRaw = jest.fn();
    service.$executeRaw = jest.fn().mockResolvedValue(1);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to database and set session parameters', async () => {
      await service.onModuleInit();

      expect(service.$connect).toHaveBeenCalled();
      expect(service.$executeRaw).toHaveBeenCalledTimes(3);
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database', async () => {
      await service.onModuleDestroy();

      expect(service.$disconnect).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true when database is healthy', async () => {
      (service.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(service.$queryRaw).toHaveBeenCalled();
    });

    it('should return false when database check fails', async () => {
      (service.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('getPoolMetrics', () => {
    it('should return connection pool metrics', async () => {
      const mockMetrics = [
        {
          total_connections: 10,
          active_connections: 3,
          idle_connections: 7,
          idle_in_transaction: 0,
        },
      ];

      (service.$queryRaw as jest.Mock).mockResolvedValue(mockMetrics);

      const result = await service.getPoolMetrics();

      expect(result).toEqual(mockMetrics);
      expect(service.$queryRaw).toHaveBeenCalled();
    });

    it('should return null when metrics query fails', async () => {
      (service.$queryRaw as jest.Mock).mockRejectedValue(new Error('Query failed'));

      const result = await service.getPoolMetrics();

      expect(result).toBeNull();
    });
  });
});
