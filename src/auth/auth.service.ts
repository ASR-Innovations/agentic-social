import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TenantService } from '../tenant/tenant.service';
import { User, UserRole } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends JwtPayload {
  tokenVersion?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: Omit<User, 'password' | 'refreshToken'>;
  tenant: {
    id: string;
    name: string;
    planTier: string;
  };
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tenantService: TenantService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    
    if (user && await this.userService.validatePassword(user, password)) {
      return user;
    }
    
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.userService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Hash and store refresh token
    const hashedRefreshToken = await this.hashToken(tokens.refresh_token);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    // Remove password and refresh token from user object
    const { password, refreshToken, ...userWithoutSensitiveData } = user;

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: userWithoutSensitiveData,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        planTier: user.tenant.planTier,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Create tenant first
    const tenant = await this.tenantService.create({
      name: registerDto.tenantName,
      planTier: registerDto.planTier,
    });

    // Create user
    const user = await this.userService.create({
      email: registerDto.email,
      password: registerDto.password,
      name: `${registerDto.firstName || ''} ${registerDto.lastName || ''}`.trim() || registerDto.email,
      tenantId: tenant.id,
      role: UserRole.ADMIN, // First user is always admin
    });

    // Load user with tenant relation
    const userWithTenant = await this.userService.findOne(user.id, tenant.id);

    // Generate tokens
    const tokens = await this.generateTokens(userWithTenant);

    // Hash and store refresh token
    const hashedRefreshToken = await this.hashToken(tokens.refresh_token);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    // Remove password and refresh token from user object
    const { password, refreshToken, ...userWithoutSensitiveData } = userWithTenant;

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: userWithoutSensitiveData,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        planTier: tenant.planTier,
      },
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findOne(payload.sub, payload.tenantId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<RefreshResponse> {
    // Find user
    const user = await this.userService.findById(userId);
    
    if (!user || !user.isActive) {
      throw new ForbiddenException('Access Denied');
    }

    // Verify stored refresh token exists
    if (!user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    // Compare refresh tokens
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    // Generate new tokens (token rotation)
    const tokens = await this.generateTokens(user);

    // Hash and update refresh token
    const hashedRefreshToken = await this.hashToken(tokens.refresh_token);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async logout(userId: string): Promise<void> {
    // Invalidate refresh token by removing it from database
    await this.userService.updateRefreshToken(userId, null);
  }

  private async generateTokens(user: User): Promise<{ access_token: string; refresh_token: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  private async hashToken(token: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(token, saltRounds);
  }
}