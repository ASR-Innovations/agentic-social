import { IsString, IsEnum, IsOptional, IsUrl, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DesignToolProvider {
  CANVA = 'CANVA',
  ADOBE_CREATIVE_CLOUD = 'ADOBE_CREATIVE_CLOUD',
  UNSPLASH = 'UNSPLASH',
  PEXELS = 'PEXELS',
}

export class ConnectDesignToolDto {
  @ApiProperty({ enum: DesignToolProvider, description: 'Design tool provider' })
  @IsEnum(DesignToolProvider)
  provider: DesignToolProvider;

  @ApiPropertyOptional({ description: 'API key or access token' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'OAuth access token' })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiPropertyOptional({ description: 'OAuth refresh token' })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({ description: 'Additional configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class CanvaDesignDto {
  @ApiProperty({ description: 'Canva design ID' })
  @IsString()
  designId: string;

  @ApiPropertyOptional({ description: 'Export format', default: 'png' })
  @IsOptional()
  @IsString()
  format?: 'png' | 'jpg' | 'pdf' | 'mp4';

  @ApiPropertyOptional({ description: 'Export quality', default: 'high' })
  @IsOptional()
  @IsString()
  quality?: 'low' | 'medium' | 'high';
}

export class CreateCanvaDesignDto {
  @ApiProperty({ description: 'Design template type' })
  @IsString()
  templateType: string;

  @ApiPropertyOptional({ description: 'Design title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Initial content' })
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;
}

export class AdobeAssetDto {
  @ApiProperty({ description: 'Adobe asset ID' })
  @IsString()
  assetId: string;

  @ApiPropertyOptional({ description: 'Asset type' })
  @IsOptional()
  @IsString()
  assetType?: string;
}

export class StockPhotoSearchDto {
  @ApiProperty({ description: 'Search query' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Number of results', default: 20 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Results per page', default: 20 })
  @IsOptional()
  perPage?: number;

  @ApiPropertyOptional({ description: 'Orientation filter' })
  @IsOptional()
  @IsString()
  orientation?: 'landscape' | 'portrait' | 'square';

  @ApiPropertyOptional({ description: 'Color filter' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class DownloadStockPhotoDto {
  @ApiProperty({ description: 'Photo ID' })
  @IsString()
  photoId: string;

  @ApiProperty({ enum: DesignToolProvider, description: 'Stock photo provider' })
  @IsEnum(DesignToolProvider)
  provider: DesignToolProvider;

  @ApiPropertyOptional({ description: 'Download size', default: 'regular' })
  @IsOptional()
  @IsString()
  size?: 'small' | 'regular' | 'large' | 'original';
}

export class ImportAssetDto {
  @ApiProperty({ description: 'Asset URL from design tool' })
  @IsUrl()
  assetUrl: string;

  @ApiProperty({ enum: DesignToolProvider, description: 'Source provider' })
  @IsEnum(DesignToolProvider)
  provider: DesignToolProvider;

  @ApiPropertyOptional({ description: 'Asset metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Folder to import into' })
  @IsOptional()
  @IsString()
  folder?: string;
}
