import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class SyncProductsDto {
  @IsString()
  integrationId: string;

  @IsOptional()
  @IsBoolean()
  fullSync?: boolean; // If true, sync all products; if false, only sync updated products

  @IsOptional()
  @IsString()
  cursor?: string; // For pagination in large catalogs
}
