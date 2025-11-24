import { PartialType } from '@nestjs/mapped-types';
import { CreateCollaborationDto } from './create-collaboration.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateCollaborationDto extends PartialType(CreateCollaborationDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actualDeliverables?: string[];

  @IsOptional()
  performanceMetrics?: {
    reach?: number;
    engagement?: number;
    conversions?: number;
    impressions?: number;
    clicks?: number;
    roi?: number;
  };
}
