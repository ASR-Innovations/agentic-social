import { IsString, IsEmail, IsEnum, IsOptional, IsObject, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  tenantId: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string; // Optional for SSO users

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  ssoProvider?: string;

  @IsString()
  @IsOptional()
  ssoProviderId?: string;

  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;
}