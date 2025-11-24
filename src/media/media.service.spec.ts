import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MediaService } from './media.service';
import { S3Service } from './s3.service';

describe('MediaService', () => {
  let service: MediaService;
  let s3Service: S3Service;

  const mockS3Service = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getSignedUrl: jest.fn(),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from('test'),
    stream: null,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    s3Service = module.get<S3Service>(S3Service);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadMedia', () => {
    it('should upload a valid image file', async () => {
      const uploadResult = {
        key: 'tenant-123/media/test-image.jpg',
        url: 'https://s3.amazonaws.com/bucket/tenant-123/media/test-image.jpg',
        cdnUrl: 'https://cdn.example.com/tenant-123/media/test-image.jpg',
        bucket: 'my-bucket',
        contentType: 'image/jpeg',
      };

      mockS3Service.uploadFile.mockResolvedValue(uploadResult);

      const result = await service.uploadMedia(mockFile, 'tenant-123', 'media');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('tenantId', 'tenant-123');
      expect(result).toHaveProperty('fileName', 'test-image.jpg');
      expect(result).toHaveProperty('originalName', 'test-image.jpg');
      expect(result).toHaveProperty('mimeType', 'image/jpeg');
      expect(result).toHaveProperty('size', 1024 * 1024);
      expect(result).toHaveProperty('url', uploadResult.url);
      expect(result).toHaveProperty('cdnUrl', uploadResult.cdnUrl);
      expect(result).toHaveProperty('s3Key', uploadResult.key);
      expect(result).toHaveProperty('folder', 'media');
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(mockFile, 'tenant-123', 'media');
    });

    it('should throw BadRequestException for file exceeding size limit', async () => {
      const largeFile = {
        ...mockFile,
        size: 51 * 1024 * 1024, // 51MB
      };

      await expect(service.uploadMedia(largeFile, 'tenant-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadMedia(largeFile, 'tenant-123')).rejects.toThrow(
        'File size exceeds 50MB limit',
      );
    });

    it('should throw BadRequestException for unsupported file type', async () => {
      const unsupportedFile = {
        ...mockFile,
        mimetype: 'application/x-executable',
      };

      await expect(service.uploadMedia(unsupportedFile, 'tenant-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadMedia(unsupportedFile, 'tenant-123')).rejects.toThrow(
        'File type not supported',
      );
    });

    it('should accept video files', async () => {
      const videoFile = {
        ...mockFile,
        originalname: 'test-video.mp4',
        mimetype: 'video/mp4',
        size: 10 * 1024 * 1024, // 10MB
      };

      const uploadResult = {
        key: 'tenant-123/media/test-video.mp4',
        url: 'https://s3.amazonaws.com/bucket/tenant-123/media/test-video.mp4',
        cdnUrl: 'https://cdn.example.com/tenant-123/media/test-video.mp4',
        bucket: 'my-bucket',
        contentType: 'video/mp4',
      };

      mockS3Service.uploadFile.mockResolvedValue(uploadResult);

      const result = await service.uploadMedia(videoFile, 'tenant-123');

      expect(result.mimeType).toBe('video/mp4');
      expect(mockS3Service.uploadFile).toHaveBeenCalled();
    });

    it('should accept PDF files', async () => {
      const pdfFile = {
        ...mockFile,
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 2 * 1024 * 1024, // 2MB
      };

      const uploadResult = {
        key: 'tenant-123/media/document.pdf',
        url: 'https://s3.amazonaws.com/bucket/tenant-123/media/document.pdf',
        cdnUrl: 'https://cdn.example.com/tenant-123/media/document.pdf',
        bucket: 'my-bucket',
        contentType: 'application/pdf',
      };

      mockS3Service.uploadFile.mockResolvedValue(uploadResult);

      const result = await service.uploadMedia(pdfFile, 'tenant-123');

      expect(result.mimeType).toBe('application/pdf');
    });
  });

  describe('deleteMedia', () => {
    it('should delete a file from S3', async () => {
      const s3Key = 'tenant-123/media/test-image.jpg';
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      await service.deleteMedia(s3Key);

      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(s3Key);
    });
  });

  describe('getSignedUrl', () => {
    it('should get a signed URL with default expiration', async () => {
      const s3Key = 'tenant-123/media/test-image.jpg';
      const signedUrl = 'https://s3.amazonaws.com/bucket/signed-url';

      mockS3Service.getSignedUrl.mockResolvedValue(signedUrl);

      const result = await service.getSignedUrl(s3Key);

      expect(result).toBe(signedUrl);
      expect(mockS3Service.getSignedUrl).toHaveBeenCalledWith(s3Key, 3600);
    });

    it('should get a signed URL with custom expiration', async () => {
      const s3Key = 'tenant-123/media/test-image.jpg';
      const signedUrl = 'https://s3.amazonaws.com/bucket/signed-url';
      const expiresIn = 7200;

      mockS3Service.getSignedUrl.mockResolvedValue(signedUrl);

      const result = await service.getSignedUrl(s3Key, expiresIn);

      expect(result).toBe(signedUrl);
      expect(mockS3Service.getSignedUrl).toHaveBeenCalledWith(s3Key, 7200);
    });
  });
});
