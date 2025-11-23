import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TenantService } from '../tenant/tenant.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let tenantService: TenantService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    updateLastLogin: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockTenantService = {
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tenantService = module.get<TenantService>(TenantService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation succeeds', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const user = {
        id: 'user-123',
        email,
        password: 'hashed-password',
        tenantId: 'tenant-123',
        role: 'admin',
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      mockUserService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
    });

    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      mockUserService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed',
        tenantId: 'tenant-123',
        role: 'admin',
        isActive: true,
        tenant: {
          id: 'tenant-123',
          name: 'Test Company',
          planTier: 'free',
        },
      };

      const accessToken = 'jwt-token-123';

      mockUserService.findByEmail.mockResolvedValue(user);
      mockUserService.validatePassword.mockResolvedValue(true);
      mockUserService.updateLastLogin.mockResolvedValue(undefined);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(result.access_token).toBe(accessToken);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginDto.email);
      expect(result.tenant).toBeDefined();
      expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(user.id);
    });
  });

  describe('register', () => {
    it('should create tenant and admin user', async () => {
      const registerDto = {
        email: 'admin@company.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        tenantName: 'Test Company',
      };

      const tenant = {
        id: 'tenant-123',
        name: registerDto.tenantName,
        planTier: 'free',
      };

      const user = {
        id: 'user-123',
        email: registerDto.email,
        tenantId: tenant.id,
        role: 'admin',
        password: 'hashed',
      };

      const userWithTenant = {
        ...user,
        tenant,
      };

      const accessToken = 'jwt-token-123';

      mockTenantService.create.mockResolvedValue(tenant);
      mockUserService.create.mockResolvedValue(user);
      mockUserService.findOne.mockResolvedValue(userWithTenant);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.register(registerDto);

      expect(result.access_token).toBe(accessToken);
      expect(result.user).toBeDefined();
      expect(result.tenant).toBeDefined();
      expect(mockTenantService.create).toHaveBeenCalledWith({
        name: registerDto.tenantName,
        planTier: undefined,
      });
    });
  });

  describe('validateJwtPayload', () => {
    it('should return user if valid', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-123',
        role: 'admin',
      };

      const user = {
        id: 'user-123',
        email: 'test@example.com',
        isActive: true,
      };

      mockUserService.findOne.mockResolvedValue(user);

      const result = await service.validateJwtPayload(payload);

      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-123',
        role: 'admin',
      };

      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.validateJwtPayload(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
