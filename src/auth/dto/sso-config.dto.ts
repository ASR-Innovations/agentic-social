import { IsString, IsUrl, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { SSOProvider } from '@prisma/client';

export { SSOProvider };

export class CreateSSOConfigDto {
  @IsEnum(SSOProvider)
  provider: SSOProvider;

  @IsString()
  tenantId: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  // SAML Configuration
  @IsUrl()
  @IsOptional()
  entryPoint?: string;

  @IsUrl()
  @IsOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  cert?: string;

  @IsUrl()
  @IsOptional()
  callbackUrl?: string;

  // OAuth 2.0 Configuration (Google, Azure AD, Okta)
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  clientSecret?: string;

  @IsString()
  @IsOptional()
  domain?: string; // For Okta

  @IsString()
  @IsOptional()
  tenantDomain?: string; // For Azure AD

  @IsString()
  @IsOptional()
  redirectUri?: string;

  // Additional metadata
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateSSOConfigDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsUrl()
  @IsOptional()
  entryPoint?: string;

  @IsUrl()
  @IsOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  cert?: string;

  @IsUrl()
  @IsOptional()
  callbackUrl?: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  clientSecret?: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  tenantDomain?: string;

  @IsString()
  @IsOptional()
  redirectUri?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class SSOLoginDto {
  @IsEnum(SSOProvider)
  provider: SSOProvider;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  email?: string;
}
