import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant, PlanTier } from './entities/tenant.entity';

describe('TenantService', () => {
  let service: TenantService;
  let repository: Repository<Tenant>;

  const mockTenant: Tenant = {
    id: 'tenant-123',
    name: 'Test Tenant',
    planTier: PlanTier.PROFESSIONAL,
    billingStatus: 'active',
    settings: {},
    aiBudgetLimit: 100,
    aiUsageCurrent: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const createDto = {
        name: 'New Tenant',
        planTier: PlanTier.STARTER,
      };

      const newTenant = {
        ...createDto,
        id: 'new-tenant-123',
        billingStatus: 'active',
        settings: {},
        aiBudgetLimit: 50,
        aiUsageCurrent: 0,
      };

      mockRepository.create.mockReturnValue(newTenant);
      mockRepository.save.mockResolvedValue(newTenant);

      const result = await service.create(createDto);

      expect(result).toEqual(newTenant);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tenants with users', async () => {
      const tenants = [mockTenant, { ...mockTenant, id: 'tenant-456' }];
      mockRepository.find.mockResolvedValue(tenants);

      const result = await service.findAll();

      expect(result).toEqual(tenants);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['users'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne('tenant-123');

      expect(result).toEqual(mockTenant);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
        relations: ['users'],
      });
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Tenant with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const updateDto = {
        name: 'Updated Tenant',
        planTier: PlanTier.ENTERPRISE,
      };

      const updatedTenant = { ...mockTenant, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.update('tenant-123', updateDto);

      expect(result).toEqual(updatedTenant);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a tenant', async () => {
      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.remove.mockResolvedValue(mockTenant);

      await service.remove('tenant-123');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAiUsage', () => {
    it('should increment AI usage by cost amount', async () => {
      mockRepository.increment.mockResolvedValue({ affected: 1 });

      await service.updateAiUsage('tenant-123', 5.5);

      expect(mockRepository.increment).toHaveBeenCalledWith(
        { id: 'tenant-123' },
        'aiUsageCurrent',
        5.5,
      );
    });
  });

  describe('resetMonthlyAiUsage', () => {
    it('should reset AI usage to zero', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.resetMonthlyAiUsage('tenant-123');

      expect(mockRepository.update).toHaveBeenCalledWith('tenant-123', {
        aiUsageCurrent: 0,
      });
    });
  });

  describe('checkAiBudgetLimit', () => {
    it('should return true if under budget limit', async () => {
      const tenant = { ...mockTenant, aiUsageCurrent: 50, aiBudgetLimit: 100 };
      mockRepository.findOne.mockResolvedValue(tenant);

      const result = await service.checkAiBudgetLimit('tenant-123');

      expect(result).toBe(true);
    });

    it('should return false if at or over budget limit', async () => {
      const tenant = { ...mockTenant, aiUsageCurrent: 100, aiBudgetLimit: 100 };
      mockRepository.findOne.mockResolvedValue(tenant);

      const result = await service.checkAiBudgetLimit('tenant-123');

      expect(result).toBe(false);
    });

    it('should return false if over budget limit', async () => {
      const tenant = { ...mockTenant, aiUsageCurrent: 150, aiBudgetLimit: 100 };
      mockRepository.findOne.mockResolvedValue(tenant);

      const result = await service.checkAiBudgetLimit('tenant-123');

      expect(result).toBe(false);
    });
  });
});
