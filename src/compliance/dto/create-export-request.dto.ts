import { IsEnum, IsArray, IsOptional, IsDateString, IsObject } from 'class-validator';
import { ExportRequestType, ExportFormat, DataType } from '@prisma/client';

export class CreateExportRequestDto {
  @IsEnum(ExportRequestType)
  requestType: ExportRequestType;

  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat;

  @IsArray()
  @IsEnum(DataType, { each: true })
  dataTypes: DataType[];

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
