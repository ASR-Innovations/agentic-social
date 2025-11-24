import { IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';
import { ComplianceReportType, ExportFormat } from '@prisma/client';

export class CreateComplianceReportDto {
  @IsEnum(ComplianceReportType)
  reportType: ComplianceReportType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  periodFrom: string;

  @IsDateString()
  periodTo: string;

  @IsOptional()
  @IsEnum(ExportFormat)
  fileFormat?: ExportFormat;
}
