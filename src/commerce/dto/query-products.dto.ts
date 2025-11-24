import { IsOptional, IsString, IsBoolean, IsNumber, IsArray, Min, Max } from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  search?: string; // Search by name or description

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  sortBy?: string; // e.g., 'name', 'price', 'createdAt'

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
