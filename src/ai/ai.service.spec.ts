import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIService } from './ai.service';
import { AIRequest, AIRequestType, AIRequestStatus } from './entities/ai-request.entity';
import { OpenAIService } from './services/openai.service';
import { AnthropicService } from './services/anthropic.service';
import { TenantService } from '../tenant/tenant.service';
import { BadRequestException } from '@nestjs/common';

describe('AIService', () => {
  let service: AIService;
  let aiRequestRepository: Repository<AIRequest>;
  let openaiService: OpenAIService;
  let anthropicService: AnthropicService;
  let tenantService: TenantService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockOpenAIService = {
    generateText: jest.fn(),
    generateImage: jest.fn(),
    generateEmbedding: jest.fn(),
    isConfigured: jest.fn().mockReturnValue(true),
  };

  const mockAnthropicService = {
    generateText: jest.fn(),
    generateTextStream: jest.fn(),
    isConfigured: jest.fn().mockReturnValue(true),
  };

  const mockTenantService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: getRepositoryToken(AIRequest),
          useValue: mockRepository,
        },
        {
          provide: OpenAIService,
          useValue: mockOpenAIService,
        },
        {
          provide: AnthropicService,
          useValue: mockAnthropicService,
        },
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    aiRequestRepository = module.get<Repository<AIRequest>>(getRepositoryToken(AIRequest));
    openaiService = module.get<OpenAIService>(OpenAIService);
    anthropicService = module.get<AnthropicService>(AnthropicService);
    tenantService = module.get<TenantService>(TenantService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCaption', () => {
    it('should generate captions successfully', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';
      const options = {
        topic: 'Product Launch',
        tone: 'professional',
        platform: 'twitter',
        variations: 3,
      };

      const tenant = {
        id: tenantId,
        aiBudgetLimit: 100,
        aiUsageCurrent: 10,
      };

      const aiRequest = {
        id: 'request-123',
        tenantId,
        userId,
        type: AIRequestType.CAPTION_GENERATION,
        status: AIRequestStatus.PROCESSING,
      };

      const generatedText = `1. Exciting news! Our new product is here 🚀
2. Launch day! Check out our latest innovation
3. We're thrilled to announce our new product`;

      mockTenantService.findOne.mockResolvedValue(tenant);
      mockRepository.create.mockReturnValue(aiRequest);
      mockRepository.save.mockResolvedValue(aiRequest);
      mockOpenAIService.generateText.mockResolvedValue({
        text: generatedText,
        tokensUsed: 150,
        cost: 0.002,
      });
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockTenantService.update.mockResolvedValue({});

      const result = await service.generateCaption(tenantId, userId, options);

      expect(result.captions).toHaveLength(3);
      expect(result.requestId).toBe(aiRequest.id);
      expect(mockOpenAIService.generateText).toHaveBeenCalled();
      expect(mockTenantService.update).toHaveBeenCalled();
    });

    it('should throw error if budget exceeded', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';
      const options = {
        topic: 'Test',
        tone: 'casual',
      };

      const tenant = {
        id: tenantId,
        aiBudgetLimit: 100,
        aiUsageCurrent: 100, // Budget exhausted
      };

      mockTenantService.findOne.mockResolvedValue(tenant);

      await expect(service.generateCaption(tenantId, userId, options)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle AI generation failure', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';
      const options = {
        topic: 'Test',
      };

      const tenant = {
        id: tenantId,
        aiBudgetLimit: 100,
        aiUsageCurrent: 10,
      };

      const aiRequest = {
        id: 'request-123',
        tenantId,
        userId,
      };

      mockTenantService.findOne.mockResolvedValue(tenant);
      mockRepository.create.mockReturnValue(aiRequest);
      mockRepository.save.mockResolvedValue(aiRequest);
      mockOpenAIService.generateText.mockRejectedValue(new Error('API Error'));
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await expect(service.generateCaption(tenantId, userId, options)).rejects.toThrow(
        BadRequestException,
      );

      // Verify error was recorded
      expect(mockRepository.update).toHaveBeenCalledWith(
        aiRequest.id,
        expect.objectContaining({
          status: AIRequestStatus.FAILED,
          errorMessage: expect.any(String),
        }),
      );
    });
  });

  describe('generateContent', () => {
    it('should generate content using Claude', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';
      const options = {
        prompt: 'Write a blog post about AI',
        contentType: 'blog',
        tone: 'informative',
      };

      const tenant = {
        id: tenantId,
        aiBudgetLimit: 100,
        aiUsageCurrent: 10,
      };

      const aiRequest = {
        id: 'request-123',
        tenantId,
        userId,
      };

      const generatedText = 'AI is revolutionizing the way we work...';

      mockTenantService.findOne.mockResolvedValue(tenant);
      mockRepository.create.mockReturnValue(aiRequest);
      mockRepository.save.mockResolvedValue(aiRequest);
      mockAnthropicService.generateText.mockResolvedValue({
        text: generatedText,
        tokensUsed: 500,
        cost: 0.005,
      });
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockTenantService.update.mockResolvedValue({});

      const result = await service.generateContent(tenantId, userId, options);

      expect(result.content).toContain(generatedText);
      expect(mockAnthropicService.generateText).toHaveBeenCalled();
    });
  });

  describe('generateImage', () => {
    it('should generate images using DALL-E', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';
      const options = {
        prompt: 'A futuristic city skyline',
        size: '1024x1024',
        n: 2,
      };

      const tenant = {
        id: tenantId,
        aiBudgetLimit: 100,
        aiUsageCurrent: 10,
      };

      const aiRequest = {
        id: 'request-123',
        tenantId,
        userId,
      };

      const images = [
        { url: 'https://example.com/image1.png' },
        { url: 'https://example.com/image2.png' },
      ];

      mockTenantService.findOne.mockResolvedValue(tenant);
      mockRepository.create.mockReturnValue(aiRequest);
      mockRepository.save.mockResolvedValue(aiRequest);
      mockOpenAIService.generateImage.mockResolvedValue({
        images,
        cost: 0.08,
      });
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockTenantService.update.mockResolvedValue({});

      const result = await service.generateImage(tenantId, userId, options as any);

      expect(result.images).toHaveLength(2);
      expect(result.images[0].url).toBe(images[0].url);
    });
  });

  describe('generateHashtags', () => {
    it('should generate relevant hashtags', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';
      const options = {
        content: 'Just launched our new product!',
        platform: 'instagram',
        count: 10,
      };

      const tenant = {
        id: tenantId,
        aiBudgetLimit: 100,
        aiUsageCurrent: 10,
      };

      const aiRequest = {
        id: 'request-123',
        tenantId,
        userId,
      };

      const generatedText = '#ProductLaunch #NewProduct #Innovation #Technology #Startup #Business #Launch #Tech #Product #Announcement';

      mockTenantService.findOne.mockResolvedValue(tenant);
      mockRepository.create.mockReturnValue(aiRequest);
      mockRepository.save.mockResolvedValue(aiRequest);
      mockOpenAIService.generateText.mockResolvedValue({
        text: generatedText,
        tokensUsed: 100,
        cost: 0.001,
      });
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockTenantService.update.mockResolvedValue({});

      const result = await service.generateHashtags(tenantId, userId, options);

      expect(result.hashtags.length).toBeGreaterThan(0);
      expect(result.hashtags[0]).toMatch(/^#/);
    });
  });

  describe('improveContent', () => {
    it('should improve content and provide suggestions', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';
      const options = {
        content: 'Our product is good.',
        improvementType: 'engagement',
      };

      const tenant = {
        id: tenantId,
        aiBudgetLimit: 100,
        aiUsageCurrent: 10,
      };

      const aiRequest = {
        id: 'request-123',
        tenantId,
        userId,
      };

      const generatedText = `IMPROVED:
Our revolutionary product transforms the way you work, delivering exceptional results every time.

SUGGESTIONS:
- Added stronger adjectives to increase impact
- Made the message more specific and benefit-focused
- Improved overall engagement potential`;

      mockTenantService.findOne.mockResolvedValue(tenant);
      mockRepository.create.mockReturnValue(aiRequest);
      mockRepository.save.mockResolvedValue(aiRequest);
      mockAnthropicService.generateText.mockResolvedValue({
        text: generatedText,
        tokensUsed: 200,
        cost: 0.003,
      });
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockTenantService.update.mockResolvedValue({});

      const result = await service.improveContent(tenantId, userId, options);

      expect(result.improvedContent).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const tenantId = 'tenant-123';

      const requests = [
        {
          type: AIRequestType.CAPTION_GENERATION,
          status: AIRequestStatus.COMPLETED,
          costUsd: 0.002,
          tokensUsed: 150,
        },
        {
          type: AIRequestType.IMAGE_GENERATION,
          status: AIRequestStatus.COMPLETED,
          costUsd: 0.04,
          tokensUsed: 0,
        },
        {
          type: AIRequestType.CAPTION_GENERATION,
          status: AIRequestStatus.COMPLETED,
          costUsd: 0.003,
          tokensUsed: 200,
        },
      ];

      mockRepository.find.mockResolvedValue(requests);

      const result = await service.getUsageStats(tenantId);

      expect(result.totalRequests).toBe(3);
      expect(result.totalCost).toBeCloseTo(0.045, 3);
      expect(result.totalTokens).toBe(350);
      expect(result.byType[AIRequestType.CAPTION_GENERATION].count).toBe(2);
      expect(result.byType[AIRequestType.IMAGE_GENERATION].count).toBe(1);
    });
  });

  describe('getRequestHistory', () => {
    it('should return paginated request history', async () => {
      const tenantId = 'tenant-123';
      const requests = [
        { id: 'req-1', type: AIRequestType.CAPTION_GENERATION },
        { id: 'req-2', type: AIRequestType.IMAGE_GENERATION },
      ];

      mockRepository.findAndCount.mockResolvedValue([requests, 2]);

      const result = await service.getRequestHistory(tenantId, { limit: 10, offset: 0 });

      expect(result.requests).toEqual(requests);
      expect(result.total).toBe(2);
    });

    it('should filter by type', async () => {
      const tenantId = 'tenant-123';
      const type = AIRequestType.CAPTION_GENERATION;
      const requests = [
        { id: 'req-1', type },
      ];

      mockRepository.findAndCount.mockResolvedValue([requests, 1]);

      const result = await service.getRequestHistory(tenantId, { type });

      expect(result.requests).toEqual(requests);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, type },
        }),
      );
    });
  });
});
