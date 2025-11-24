import { IsOptional, IsBoolean, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum VideoFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  MOV = 'mov',
}

export class VideoUploadDto {
  @IsOptional()
  @IsBoolean()
  compress?: boolean;

  @IsOptional()
  @IsEnum(VideoFormat)
  targetFormat?: VideoFormat;

  @IsOptional()
  @IsNumber()
  @Min(320)
  @Max(3840)
  maxWidth?: number;

  @IsOptional()
  @IsNumber()
  @Min(240)
  @Max(2160)
  maxHeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number;

  @IsOptional()
  targetBitrate?: string;
}
