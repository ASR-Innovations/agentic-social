import { IsString, IsOptional, IsUrl, IsObject, IsBoolean, ValidateNested, IsHexColor, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BrandingColorsDto {
  @ApiProperty({ description: 'Primary brand color (hex)', example: '#3B82F6' })
  @IsHexColor()
  primary: string;

  @ApiProperty({ description: 'Secondary brand color (hex)', example: '#10B981' })
  @IsHexColor()
  secondary: string;

  @ApiPropertyOptional({ description: 'Accent color (hex)', example: '#F59E0B' })
  @IsOptional()
  @IsHexColor()
  accent?: string;

  @ApiPropertyOptional({ description: 'Background color (hex)', example: '#FFFFFF' })
  @IsOptional()
  @IsHexColor()
  background?: string;

  @ApiPropertyOptional({ description: 'Text color (hex)', example: '#1F2937' })
  @IsOptional()
  @IsHexColor()
  text?: string;
}

export class BrandingFontsDto {
  @ApiProperty({ description: 'Primary font family', example: 'Inter' })
  @IsString()
  primary: string;

  @ApiPropertyOptional({ description: 'Secondary font family', example: 'Roboto' })
  @IsOptional()
  @IsString()
  secondary?: string;

  @ApiPropertyOptional({ description: 'Heading font family', example: 'Poppins' })
  @IsOptional()
  @IsString()
  heading?: string;
}

export class EmailBrandingDto {
  @ApiPropertyOptional({ description: 'Email header logo URL' })
  @IsOptional()
  @IsUrl()
  headerLogoUrl?: string;

  @ApiPropertyOptional({ description: 'Email footer logo URL' })
  @IsOptional()
  @IsUrl()
  footerLogoUrl?: string;

  @ApiPropertyOptional({ description: 'Email header background color' })
  @IsOptional()
  @IsHexColor()
  headerBackgroundColor?: string;

  @ApiPropertyOptional({ description: 'Email footer text' })
  @IsOptional()
  @IsString()
  footerText?: string;

  @ApiPropertyOptional({ description: 'Support email address' })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiPropertyOptional({ description: 'Company address for email footer' })
  @IsOptional()
  @IsString()
  companyAddress?: string;
}

export class CustomDomainDto {
  @ApiProperty({ description: 'Custom domain name', example: 'app.yourbrand.com' })
  @IsString()
  domain: string;

  @ApiPropertyOptional({ description: 'SSL certificate status' })
  @IsOptional()
  @IsString()
  sslStatus?: string;

  @ApiPropertyOptional({ description: 'Domain verification status' })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({ description: 'DNS records for verification' })
  @IsOptional()
  @IsObject()
  dnsRecords?: Record<string, string>;
}

export class WhiteLabelConfigDto {
  @ApiPropertyOptional({ description: 'Enable white-label mode' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Company/Brand name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Favicon URL' })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiPropertyOptional({ description: 'Brand colors configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingColorsDto)
  colors?: BrandingColorsDto;

  @ApiPropertyOptional({ description: 'Font configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingFontsDto)
  fonts?: BrandingFontsDto;

  @ApiPropertyOptional({ description: 'Email branding configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailBrandingDto)
  emailBranding?: EmailBrandingDto;

  @ApiPropertyOptional({ description: 'Custom domain configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomDomainDto)
  customDomain?: CustomDomainDto;

  @ApiPropertyOptional({ description: 'Hide platform branding in reports' })
  @IsOptional()
  @IsBoolean()
  hidePlatformBranding?: boolean;

  @ApiPropertyOptional({ description: 'Custom CSS for advanced styling' })
  @IsOptional()
  @IsString()
  customCss?: string;

  @ApiPropertyOptional({ description: 'Custom JavaScript for advanced functionality' })
  @IsOptional()
  @IsString()
  customJs?: string;

  @ApiPropertyOptional({ description: 'Terms of service URL' })
  @IsOptional()
  @IsUrl()
  termsUrl?: string;

  @ApiPropertyOptional({ description: 'Privacy policy URL' })
  @IsOptional()
  @IsUrl()
  privacyUrl?: string;

  @ApiPropertyOptional({ description: 'Support URL' })
  @IsOptional()
  @IsUrl()
  supportUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateWhiteLabelDto extends WhiteLabelConfigDto {}

export class WhiteLabelResponseDto {
  @ApiProperty()
  workspaceId: string;

  @ApiProperty()
  config: WhiteLabelConfigDto;

  @ApiProperty()
  updatedAt: Date;
}
