import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VideoService } from './video.service';
import { S3Service } from './s3.service';
import { BadRequestException } from '@nestjs/common';

describe('VideoService', () => {
  let service: VideoService;
  let s3Service: S3Service;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'TEMP_DIR') return '/tmp/video-processing';
      return null;
    }),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateVideoFile', () => {
    it('should accept valid video files', () => {
      const validFile = {
        originalname: 'test.mp4',
        mimetype: 'video/mp4',
        size: 100 * 1024 * 1024, // 100MB
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      expect(() => service.validateVideoFile(validFile)).not.toThrow();
    });

    it('should reject files exceeding size limit', () => {
      const largeFile = {
        originalname: 'large.mp4',
        mimetype: 'video/mp4',
        size: 600 * 1024 * 1024, // 600MB
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      expect(() => service.validateVideoFile(largeFile)).toThrow(
        BadRequestException,
      );
      expect(() => service.validateVideoFile(largeFile)).toThrow(
        'Video file size exceeds 500MB limit',
      );
    });

    it('should reject unsupported file types', () => {
      const invalidFile = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      expect(() => service.validateVideoFile(invalidFile)).toThrow(
        BadRequestException,
      );
      expect(() => service.validateVideoFile(invalidFile)).toThrow(
        /Video type not supported/,
      );
    });

    it('should accept all supported video formats', () => {
      const supportedFormats = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-matroska',
      ];

      supportedFormats.forEach((mimetype) => {
        const file = {
          originalname: 'test.mp4',
          mimetype,
          size: 1024 * 1024,
          buffer: Buffer.from('test'),
        } as Express.Multer.File;

        expect(() => service.validateVideoFile(file)).not.toThrow();
      });
    });
  });

  describe('extractMetadata', () => {
    it('should extract video metadata', async () => {
      // Mock the fs.stat call
      const fs = require('fs/promises');
      jest.spyOn(fs, 'stat').mockResolvedValue({ size: 1024 * 1024 });

      const metadata = await service.extractMetadata('/tmp/test.mp4');

      expect(metadata).toBeDefined();
      expect(metadata.duration).toBeGreaterThan(0);
      expect(metadata.width).toBeGreaterThan(0);
      expect(metadata.height).toBeGreaterThan(0);
      expect(metadata.codec).toBeDefined();
      expect(metadata.format).toBeDefined();
    });
  });
});
