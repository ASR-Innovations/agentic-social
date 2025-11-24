import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { SSOController } from './controllers/sso.controller';
import { SecurityController } from './controllers/security.controller';
import { UserModule } from '../user/user.module';
import { TenantModule } from '../tenant/tenant.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { SamlStrategy } from './strategies/saml.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AzureADStrategy } from './strategies/azure-ad.strategy';
import { OktaStrategy } from './strategies/okta.strategy';
import { PermissionService } from './services/permission.service';
import { SSOService } from './services/sso.service';
import { IPWhitelistService } from './services/ip-whitelist.service';
import { TwoFactorService } from './services/two-factor.service';
import { SessionService } from './services/session.service';
import { SecurityAuditService } from './services/security-audit.service';
import { SecurityScanService } from './services/security-scan.service';
import { EncryptionService } from './services/encryption.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { IPWhitelistGuard } from './guards/ip-whitelist.guard';

@Module({
  imports: [
    UserModule,
    TenantModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, PermissionsController, SSOController, SecurityController],
  providers: [
    AuthService, 
    PermissionService,
    SSOService,
    IPWhitelistService,
    TwoFactorService,
    SessionService,
    SecurityAuditService,
    SecurityScanService,
    EncryptionService,
    JwtStrategy, 
    LocalStrategy, 
    RefreshTokenStrategy,
    SamlStrategy,
    GoogleStrategy,
    AzureADStrategy,
    OktaStrategy,
    PermissionsGuard,
    IPWhitelistGuard,
  ],
  exports: [
    AuthService, 
    PermissionService, 
    SSOService, 
    IPWhitelistService,
    TwoFactorService,
    SessionService,
    SecurityAuditService,
    SecurityScanService,
    EncryptionService,
    PermissionsGuard,
    IPWhitelistGuard,
  ],
})
export class AuthModule {}