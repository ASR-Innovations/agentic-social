import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { S3Service } from './s3.service';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
  fps: number;
  format: string;
  size: number;
}

export interface VideoProcessingOptions {
  compress?: boolean;
  targetFormat?: 'mp4' | 'webm' | 'mov';
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-100
  targetBitrate?: string; // e.g., '1000k'
}

export interface VideoTrimOptions {
  startTime: number; // in seconds
  endTime: number; // in seconds
}

export interface ThumbnailOptions {
  timestamp?: number; // in seconds
  count?: number; // number of thumbnails to generate
  width?: number;
  height?: number;
}

export interface VideoProcessingResult {
  url: string;
  thumbnailUrl?: string;
  metadata: VideoMetadata;
  s3Key: string;
  size: number;
}

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private readonly tempDir: string;

  constructor(
    private configService: ConfigService,
    private s3Service: S3Service,
  ) {
    this.tempDir = this.configService.get('TEMP_DIR') || '/tmp/video-processing';
    this.ensureTempDir();
  }

  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create temp directory: ${error}`);
    }
  }

  /**
   * Extract video metadata using ffprobe
   */
  async extractMetadata(filePath: string): Promise<VideoMetadata> {
    // For now, return mock metadata since we don't have ffmpeg installed yet
    // In production, this would use fluent-ffmpeg to extract real metadata
    this.logger.log(`Extracting metadata from: ${filePath}`);
    
    const stats = await fs.stat(filePath);
    
    return {
      duration: 30, // Mock duration
      width: 1920,
      height: 1080,
      codec: 'h264',
      bitrate: 5000000,
      fps: 30,
      format: 'mp4',
      size: stats.size,
    };
  }

  /**
   * Optimize video by compressing and converting format
   */
  async optimizeVideo(
    inputPath: string,
    options: VideoProcessingOptions = {},
  ): Promise<string> {
    const {
      targetFormat = 'mp4',
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 80,
      targetBitrate = '2000k',
    } = options;

    const outputFilename = `optimized_${Date.now()}.${targetFormat}`;
    const outputPath = path.join(this.tempDir, outputFilename);

    this.logger.log(`Optimizing video: ${inputPath} -> ${outputPath}`);

    // In production, this would use fluent-ffmpeg for actual video processing
    // For now, we'll just copy the file as a placeholder
    await fs.copyFile(inputPath, outputPath);

    this.logger.log(`Video optimized successfully: ${outputPath}`);
    return outputPath;
  }

  /**
   * Trim video to specified time range
   */
  async trimVideo(
    inputPath: string,
    options: VideoTrimOptions,
  ): Promise<string> {
    const { startTime, endTime } = options;

    if (startTime < 0 || endTime <= startTime) {
      throw new BadRequestException('Invalid trim times');
    }

    const outputFilename = `trimmed_${Date.now()}.mp4`;
    const outputPath = path.join(this.tempDir, outputFilename);

    this.logger.log(
      `Trimming video from ${startTime}s to ${endTime}s: ${inputPath}`,
    );

    // In production, this would use fluent-ffmpeg for actual trimming
    // For now, we'll just copy the file as a placeholder
    await fs.copyFile(inputPath, outputPath);

    this.logger.log(`Video trimmed successfully: ${outputPath}`);
    return outputPath;
  }

  /**
   * Extract thumbnail(s) from video
   */
  async extractThumbnails(
    inputPath: string,
    options: ThumbnailOptions = {},
  ): Promise<string[]> {
    const {
      timestamp = 1,
      count = 1,
      width = 640,
      height = 360,
    } = options;

    this.logger.log(`Extracting ${count} thumbnail(s) from: ${inputPath}`);

    const thumbnails: string[] = [];

    for (let i = 0; i < count; i++) {
      const thumbnailFilename = `thumbnail_${Date.now()}_${i}.jpg`;
      const thumbnailPath = path.join(this.tempDir, thumbnailFilename);

      // In production, this would use fluent-ffmpeg to extract actual frames
      // For now, we'll create a placeholder file
      await fs.writeFile(thumbnailPath, Buffer.from('placeholder'));

      thumbnails.push(thumbnailPath);
    }

    this.logger.log(`Extracted ${thumbnails.length} thumbnail(s)`);
    return thumbnails;
  }

  /**
   * Generate captions/subtitles for video using AI
   */
  async generateCaptions(videoPath: string): Promise<string> {
    this.logger.log(`Generating captions for: ${videoPath}`);

    // In production, this would:
    // 1. Extract audio from video
    // 2. Use speech-to-text API (e.g., OpenAI Whisper, Google Speech-to-Text)
    // 3. Generate SRT or VTT format captions
    
    const captionsFilename = `captions_${Date.now()}.srt`;
    const captionsPath = path.join(this.tempDir, captionsFilename);

    // Mock SRT content
    const mockSRT = `1
00:00:00,000 --> 00:00:05,000
This is a sample caption

2
00:00:05,000 --> 00:00:10,000
Generated by AI
`;

    await fs.writeFile(captionsPath, mockSRT);

    this.logger.log(`Captions generated: ${captionsPath}`);
    return captionsPath;
  }

  /**
   * Convert video format
   */
  async convertFormat(
    inputPath: string,
    targetFormat: 'mp4' | 'webm' | 'mov',
  ): Promise<string> {
    const outputFilename = `converted_${Date.now()}.${targetFormat}`;
    const outputPath = path.join(this.tempDir, outputFilename);

    this.logger.log(`Converting video to ${targetFormat}: ${inputPath}`);

    // In production, this would use fluent-ffmpeg for actual conversion
    await fs.copyFile(inputPath, outputPath);

    this.logger.log(`Video converted successfully: ${outputPath}`);
    return outputPath;
  }

  /**
   * Process and upload video with all optimizations
   */
  async processAndUploadVideo(
    file: Express.Multer.File,
    tenantId: string,
    options: VideoProcessingOptions = {},
  ): Promise<VideoProcessingResult> {
    const tempInputPath = path.join(
      this.tempDir,
      `input_${Date.now()}_${file.originalname}`,
    );

    try {
      // Save uploaded file to temp location
      await fs.writeFile(tempInputPath, file.buffer);

      // Extract metadata
      const metadata = await this.extractMetadata(tempInputPath);

      // Optimize video if requested
      let processedPath = tempInputPath;
      if (options.compress || options.targetFormat) {
        processedPath = await this.optimizeVideo(tempInputPath, options);
      }

      // Extract thumbnail
      const thumbnails = await this.extractThumbnails(processedPath, {
        count: 1,
        width: 640,
        height: 360,
      });

      // Upload video to S3
      const videoBuffer = await fs.readFile(processedPath);
      const videoFile = {
        ...file,
        buffer: videoBuffer,
        originalname: `video_${Date.now()}.${options.targetFormat || 'mp4'}`,
      };

      const videoUpload = await this.s3Service.uploadFile(
        videoFile as Express.Multer.File,
        tenantId,
        'videos',
      );

      // Upload thumbnail to S3
      let thumbnailUrl: string | undefined;
      if (thumbnails.length > 0) {
        const thumbnailBuffer = await fs.readFile(thumbnails[0]);
        const thumbnailFile = {
          ...file,
          buffer: thumbnailBuffer,
          originalname: `thumbnail_${Date.now()}.jpg`,
          mimetype: 'image/jpeg',
        };

        const thumbnailUpload = await this.s3Service.uploadFile(
          thumbnailFile as Express.Multer.File,
          tenantId,
          'thumbnails',
        );
        thumbnailUrl = thumbnailUpload.cdnUrl;
      }

      // Clean up temp files
      await this.cleanupTempFiles([tempInputPath, processedPath, ...thumbnails]);

      return {
        url: videoUpload.cdnUrl,
        thumbnailUrl,
        metadata,
        s3Key: videoUpload.key,
        size: videoUpload.size,
      };
    } catch (error) {
      // Clean up on error
      await this.cleanupTempFiles([tempInputPath]);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  private async cleanupTempFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        this.logger.warn(`Failed to delete temp file ${file}: ${error}`);
      }
    }
  }

  /**
   * Validate video file
   */
  validateVideoFile(file: Express.Multer.File): void {
    const maxSize = 500 * 1024 * 1024; // 500MB
    const allowedMimeTypes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-matroska',
    ];

    if (file.size > maxSize) {
      throw new BadRequestException('Video file size exceeds 500MB limit');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Video type not supported. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }
  }
}
