import { IsString, IsArray, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TagProductDto {
  @ApiProperty({ description: 'Post ID' })
  @IsString()
  postId: string;

  @ApiProperty({ description: 'Product ID from commerce platform' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'X position in image (0-1)' })
  @IsNumber()
  @Min(0)
  x: number;

  @ApiProperty({ description: 'Y position in image (0-1)' })
  @IsNumber()
  @Min(0)
  y: number;
}

export class CreateShoppablePostDto {
  @ApiProperty({ description: 'Instagram account ID' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Post content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Media URLs' })
  @IsArray()
  @IsString({ each: true })
  mediaUrls: string[];

  @ApiProperty({ description: 'Product tags' })
  @IsArray()
  productTags: {
    productId: string;
    x: number;
    y: number;
    mediaIndex?: number; // For carousel posts
  }[];

  @ApiProperty({ description: 'Schedule time (optional)', required: false })
  @IsOptional()
  scheduledAt?: Date;
}

export class InstagramShopProductDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ description: 'Product image URL' })
  imageUrl: string;

  @ApiProperty({ description: 'Product URL' })
  url: string;

  @ApiProperty({ description: 'Availability' })
  inStock: boolean;
}

export class SyncInstagramShopDto {
  @ApiProperty({ description: 'Instagram account ID' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Commerce platform', enum: ['shopify', 'woocommerce', 'bigcommerce'] })
  @IsString()
  platform: 'shopify' | 'woocommerce' | 'bigcommerce';
}
