import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TenantService } from '../tenant/tenant.service';
import { User, UserRole } from '../user/entities/user.entity';
import { PlanTier } from '../tenant/entities/tenant.entity';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn((data: string) => Promise.resolve(`hashed_${data}`)),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let tenantService: TenantService;
  let jwtService: JwtService;
  let configService: ConfigService;

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
    tenant: {
      id: 'tenant-123',
      name: 'Test Tenant',
      planTier: PlanTier.PROFESSIONAL,
      billingStatus: 'active',
      settings: {},
      aiBudgetLimit: 100,
      aiUsageCurrent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [],
    },
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
    updateLastLogin: jest.fn(),
    updateRefreshToken: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockTenantService = {
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: TenantService, useValue: mockTenantService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tenantService = module.get<TenantService>(TenantService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(mockUser, 'password123');
    });

    it('should return null when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(mockUserService.validatePassword).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(mockUser, 'wrongpassword');
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login and return tokens with user data', async () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-123';

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(true);
      mockUserService.updateLastLogin.mockResolvedValue(undefined);
      mockUserService.updateRefreshToken.mockResolvedValue(undefined);
      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token', accessToken);
      expect(result).toHaveProperty('refresh_token', refreshToken);
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshToken');
      expect(result).toHaveProperty('tenant');
      expect(result.tenant.id).toBe('tenant-123');
      expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(mockUserService.updateRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException when account is deactivated', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserService.findByEmail.mockResolvedValue(inactiveUser);
      mockUserService.validatePassword.mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Account is deactivated');
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      tenantName: 'New Tenant',
      planTier: PlanTier.STARTER,
    };

    it('should successfully register a new user and tenant', async () => {
      const newTenant = {
        id: 'new-tenant-123',
        name: 'New Tenant',
        planTier: PlanTier.STARTER,
      };

      const newUser = {
        ...mockUser,
        id: 'new-user-123',
        email: 'newuser@example.com',
        tenantId: newTenant.id,
        tenant: { ...mockUser.tenant, ...newTenant },
      };

      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-123';

      mockTenantService.create.mockResolvedValue(newTenant);
      mockUserService.create.mockResolvedValue(newUser);
      mockUserService.findOne.mockResolvedValue(newUser);
      mockUserService.updateRefreshToken.mockResolvedValue(undefined);
      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token', accessToken);
      expect(result).toHaveProperty('refresh_token', refreshToken);
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshToken');
      expect(result).toHaveProperty('tenant');
      expect(mockTenantService.create).toHaveBeenCalledWith({
        name: registerDto.tenantName,
        planTier: registerDto.planTier,
      });
      expect(mockUserService.create).toHaveBeenCalledWith({
        ...registerDto,
        tenantId: newTenant.id,
        role: UserRole.ADMIN,
      });
    });
  });

  describe('validateJwtPayload', () => {
    const payload = {
      sub: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-123',
      role: 'admin',
    };

    it('should return user when payload is valid', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateJwtPayload(payload);

      expect(result).toEqual(mockUser);
      expect(mockUserService.findOne).toHaveBeenCalledWith(payload.sub, payload.tenantId);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.validateJwtPayload(payload)).rejects.toThrow(UnauthorizedException);
      await expect(service.validateJwtPayload(payload)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserService.findOne.mockResolvedValue(inactiveUser);

      await expect(service.validateJwtPayload(payload)).rejects.toThrow(UnauthorizedException);
      await expect(service.validateJwtPayload(payload)).rejects.toThrow('Invalid token');
    });
  });

  describe('refreshTokens', () => {
    const userId = 'user-123';
    const refreshToken = 'refresh-token-123';
    const hashedRefreshToken = '$2b$10$hashedrefreshtoken';
    const bcrypt = require('bcrypt');

    beforeEach(() => {
      bcrypt.compare.mockClear();
    });

    it('should successfully refresh tokens', async () => {
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: hashedRefreshToken,
      };

      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      mockUserService.findById.mockResolvedValue(userWithRefreshToken);
      bcrypt.compare.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce(newAccessToken)
        .mockResolvedValueOnce(newRefreshToken);
      mockUserService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refreshTokens(userId, refreshToken);

      expect(result).toHaveProperty('access_token', newAccessToken);
      expect(result).toHaveProperty('refresh_token', newRefreshToken);
      expect(mockUserService.findById).toHaveBeenCalledWith(userId);
      expect(mockUserService.updateRefreshToken).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(ForbiddenException);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow('Access Denied');
    });

    it('should throw ForbiddenException when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserService.findById.mockResolvedValue(inactiveUser);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(ForbiddenException);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow('Access Denied');
    });

    it('should throw ForbiddenException when refresh token is not stored', async () => {
      const userWithoutRefreshToken = { ...mockUser, refreshToken: null };
      mockUserService.findById.mockResolvedValue(userWithoutRefreshToken);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(ForbiddenException);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow('Access Denied');
    });

    it('should throw ForbiddenException when refresh token does not match', async () => {
      const userWithRefreshToken = {
        ...mockUser,
        refreshToken: hashedRefreshToken,
      };

      mockUserService.findById.mockResolvedValue(userWithRefreshToken);
      bcrypt.compare.mockResolvedValue(false);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(ForbiddenException);
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow('Access Denied');
    });
  });

  describe('logout', () => {
    it('should successfully logout by invalidating refresh token', async () => {
      const userId = 'user-123';
      mockUserService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout(userId);

      expect(mockUserService.updateRefreshToken).toHaveBeenCalledWith(userId, null);
    });
  });
});
