import { IsString, IsArray, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GridPreviewRequestDto {
  @ApiProperty({ description: 'Instagram account ID' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Number of posts to include in preview', default: 9 })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;
}

export class GridPostDto {
  @ApiProperty({ description: 'Post ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Media URL' })
  @IsString()
  mediaUrl: string;

  @ApiProperty({ description: 'Thumbnail URL for videos' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Media type' })
  @IsString()
  type: 'image' | 'video' | 'carousel';

  @ApiProperty({ description: 'Position in grid (0-based)' })
  @IsInt()
  @Min(0)
  position: number;

  @ApiProperty({ description: 'Dominant colors in the media' })
  @IsOptional()
  @IsArray()
  dominantColors?: string[];

  @ApiProperty({ description: 'Published or scheduled date' })
  @IsOptional()
  publishedAt?: Date;
}

export class GridRearrangeDto {
  @ApiProperty({ description: 'Instagram account ID' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Array of post IDs in new order' })
  @IsArray()
  @IsString({ each: true })
  postOrder: string[];
}

export class GridPreviewResponseDto {
  @ApiProperty({ description: 'Grid posts in order' })
  posts: GridPostDto[];

  @ApiProperty({ description: 'Aesthetic score (0-100)' })
  aestheticScore: number;

  @ApiProperty({ description: 'Color harmony analysis' })
  colorHarmony: {
    score: number;
    dominantPalette: string[];
    suggestions: string[];
  };

  @ApiProperty({ description: 'Theme consistency' })
  themeConsistency: {
    score: number;
    detectedThemes: string[];
    suggestions: string[];
  };
}
