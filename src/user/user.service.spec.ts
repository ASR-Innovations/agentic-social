import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: '$2b$12$hashedpassword',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.ADMIN,
    tenantId: 'tenant-123',
    preferences: {},
    isActive: true,
    lastLoginAt: new Date(),
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: null,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      tenantId: 'tenant-123',
      role: UserRole.EDITOR,
    };

    it('should create a new user with hashed password', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...createUserDto, id: 'new-user-123' });
      mockRepository.save.mockResolvedValue({ ...createUserDto, id: 'new-user-123' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password123');

      const result = await service.create(createUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createUserDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });

    it('should create user without password for SSO users', async () => {
      const ssoUserDto = {
        email: 'sso@example.com',
        firstName: 'SSO',
        lastName: 'User',
        tenantId: 'tenant-123',
        role: UserRole.VIEWER,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...ssoUserDto, id: 'sso-user-123' });
      mockRepository.save.mockResolvedValue({ ...ssoUserDto, id: 'sso-user-123' });

      await service.create(ssoUserDto as any);

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users for a tenant', async () => {
      const tenantId = 'tenant-123';
      const users = [mockUser, { ...mockUser, id: 'user-456' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll(tenantId);

      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId },
        relations: ['tenant'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id and tenantId', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123', 'tenant-123');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123', tenantId: 'tenant-123' },
        relations: ['tenant'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'tenant-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['tenant'],
      });
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { firstName: 'Updated', lastName: 'Name' };
      const updatedUser = { ...mockUser, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should hash password if provided in update', async () => {
      const updateDto = { password: 'newpassword123' };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_newpassword123');

      await service.update('user-123', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 12);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(mockUser);

      await service.remove('user-123', 'tenant-123');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'tenant-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(mockUser, 'password123');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(mockUser, 'wrongpassword');

      expect(result).toBe(false);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateLastLogin('user-123');

      expect(mockRepository.update).toHaveBeenCalledWith('user-123', {
        lastLoginAt: expect.any(Date),
      });
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateRefreshToken('user-123', 'new-refresh-token');

      expect(mockRepository.update).toHaveBeenCalledWith('user-123', {
        refreshToken: 'new-refresh-token',
      });
    });

    it('should clear refresh token when null is provided', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateRefreshToken('user-123', null);

      expect(mockRepository.update).toHaveBeenCalledWith('user-123', {
        refreshToken: null,
      });
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        relations: ['tenant'],
      });
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const updatedUser = { ...mockUser, role: UserRole.MANAGER };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateRole('user-123', UserRole.MANAGER);

      expect(result.role).toBe(UserRole.MANAGER);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateRole('non-existent', UserRole.MANAGER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
