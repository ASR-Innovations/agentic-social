import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ThumbnailExtractDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  timestamp?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  count?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(1920)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(1080)
  height?: number;
}
