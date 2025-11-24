import { IsEnum, IsArray, IsOptional, IsDateString, IsObject, IsString, IsBoolean } from 'class-validator';
import { DeletionRequestType, DataType } from '@prisma/client';

export class CreateDeletionRequestDto {
  @IsEnum(DeletionRequestType)
  requestType: DeletionRequestType;

  @IsArray()
  @IsEnum(DataType, { each: true })
  dataTypes: DataType[];

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
