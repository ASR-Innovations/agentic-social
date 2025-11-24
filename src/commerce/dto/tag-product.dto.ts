import { IsString, IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';

export class TagProductDto {
  @IsString()
  postId: string;

  @IsString()
  productId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mediaIndex?: number; // Which media item in the post (0-indexed)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  xPosition?: number; // X coordinate (0-1) for image tagging

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  yPosition?: number; // Y coordinate (0-1) for image tagging
}
