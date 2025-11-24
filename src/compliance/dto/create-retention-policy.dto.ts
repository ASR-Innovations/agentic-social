import { IsString, IsInt, IsEnum, IsOptional, IsBoolean, IsObject, Min } from 'class-validator';
import { DataType, RetentionAction } from '@prisma/client';

export class CreateRetentionPolicyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DataType)
  dataType: DataType;

  @IsInt()
  @Min(1)
  retentionDays: number;

  @IsEnum(RetentionAction)
  action: RetentionAction;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
