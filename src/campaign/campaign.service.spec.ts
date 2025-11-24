import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from './campaign.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignStatus } from '@prisma/client';

describe('CampaignService', () => {
  let service: CampaignService;
  let prisma: PrismaService;

  const mockPrismaService = {
    campaign: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    post: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a campaign with valid data', async () => {
      const workspaceId = 'workspace-1';
      const createDto = {
        name: 'Summer Sale 2024',
        description: 'Summer promotional campaign',
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-08-31T23:59:59Z',
        budget: 5000,
        tags: ['summer', 'sale'],
      };

      const expectedCampaign = {
        id: 'campaign-1',
        workspaceId,
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        status: CampaignStatus.DRAFT,
        posts: [],
      };

      mockPrismaService.campaign.create.mockResolvedValue(expectedCampaign);

      const result = await service.create(workspaceId, createDto);

      expect(result).toEqual(expectedCampaign);
      expect(mockPrismaService.campaign.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: createDto.name,
            workspaceId,
            status: CampaignStatus.DRAFT,
          }),
        }),
      );
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      const workspaceId = 'workspace-1';
      const createDto = {
        name: 'Invalid Campaign',
        startDate: '2024-08-31T00:00:00Z',
        endDate: '2024-06-01T00:00:00Z',
      };

      await expect(service.create(workspaceId, createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should auto-generate UTM parameters if not provided', async () => {
      const workspaceId = 'workspace-1';
      const createDto = {
        name: 'Test Campaign',
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-08-31T23:59:59Z',
      };

      mockPrismaService.campaign.create.mockResolvedValue({
        id: 'campaign-1',
        ...createDto,
      });

      await service.create(workspaceId, createDto as any);

      expect(mockPrismaService.campaign.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            utmParams: expect.objectContaining({
              source: 'social',
              medium: 'organic',
              campaign: 'test-campaign',
            }),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated campaigns', async () => {
      const workspaceId = 'workspace-1';
      const query = { page: 1, limit: 10 };

      const mockCampaigns = [
        { id: 'campaign-1', name: 'Campaign 1', workspaceId },
        { id: 'campaign-2', name: 'Campaign 2', workspaceId },
      ];

      mockPrismaService.campaign.findMany.mockResolvedValue(mockCampaigns);
      mockPrismaService.campaign.count.mockResolvedValue(2);

      const result = await service.findAll(workspaceId, query);

      expect(result).toEqual({
        campaigns: mockCampaigns,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('should filter campaigns by status', async () => {
      const workspaceId = 'workspace-1';
      const query = { status: CampaignStatus.ACTIVE, page: 1, limit: 10 };

      mockPrismaService.campaign.findMany.mockResolvedValue([]);
      mockPrismaService.campaign.count.mockResolvedValue(0);

      await service.findAll(workspaceId, query);

      expect(mockPrismaService.campaign.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: CampaignStatus.ACTIVE,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a campaign by ID', async () => {
      const workspaceId = 'workspace-1';
      const campaignId = 'campaign-1';
      const mockCampaign = {
        id: campaignId,
        name: 'Test Campaign',
        workspaceId,
      };

      mockPrismaService.campaign.findFirst.mockResolvedValue(mockCampaign);

      const result = await service.findOne(workspaceId, campaignId);

      expect(result).toEqual(mockCampaign);
    });

    it('should throw NotFoundException if campaign not found', async () => {
      const workspaceId = 'workspace-1';
      const campaignId = 'non-existent';

      mockPrismaService.campaign.findFirst.mockResolvedValue(null);

      await expect(service.findOne(workspaceId, campaignId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a campaign', async () => {
      const workspaceId = 'workspace-1';
      const campaignId = 'campaign-1';
      const updateDto = {
        name: 'Updated Campaign',
        status: CampaignStatus.ACTIVE,
      };

      const existingCampaign = {
        id: campaignId,
        name: 'Old Name',
        workspaceId,
      };

      const updatedCampaign = {
        ...existingCampaign,
        ...updateDto,
      };

      mockPrismaService.campaign.findFirst.mockResolvedValue(existingCampaign);
      mockPrismaService.campaign.update.mockResolvedValue(updatedCampaign);

      const result = await service.update(workspaceId, campaignId, updateDto);

      expect(result).toEqual(updatedCampaign);
    });
  });

  describe('remove', () => {
    it('should delete a campaign without posts', async () => {
      const workspaceId = 'workspace-1';
      const campaignId = 'campaign-1';

      mockPrismaService.campaign.findFirst.mockResolvedValue({
        id: campaignId,
        workspaceId,
      });
      mockPrismaService.post.count.mockResolvedValue(0);
      mockPrismaService.campaign.delete.mockResolvedValue({});

      await service.remove(workspaceId, campaignId);

      expect(mockPrismaService.campaign.delete).toHaveBeenCalledWith({
        where: { id: campaignId },
      });
    });

    it('should throw BadRequestException if campaign has posts', async () => {
      const workspaceId = 'workspace-1';
      const campaignId = 'campaign-1';

      mockPrismaService.campaign.findFirst.mockResolvedValue({
        id: campaignId,
        workspaceId,
      });
      mockPrismaService.post.count.mockResolvedValue(5);

      await expect(service.remove(workspaceId, campaignId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addPost', () => {
    it('should associate a post with a campaign', async () => {
      const workspaceId = 'workspace-1';
      const campaignId = 'campaign-1';
      const postId = 'post-1';

      mockPrismaService.campaign.findFirst.mockResolvedValue({
        id: campaignId,
        workspaceId,
      });
      mockPrismaService.post.findFirst.mockResolvedValue({
        id: postId,
        workspaceId,
      });
      mockPrismaService.post.update.mockResolvedValue({});

      await service.addPost(workspaceId, campaignId, postId);

      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: { campaignId },
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      const workspaceId = 'workspace-1';
      const campaignId = 'campaign-1';
      const postId = 'non-existent';

      mockPrismaService.campaign.findFirst.mockResolvedValue({
        id: campaignId,
        workspaceId,
      });
      mockPrismaService.post.findFirst.mockResolvedValue(null);

      await expect(
        service.addPost(workspaceId, campaignId, postId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removePost', () => {
    it('should remove a post from a campaign', async () => {
      const workspaceId = 'workspace-1';
      const campaignId = 'campaign-1';
      const postId = 'post-1';

      mockPrismaService.campaign.findFirst.mockResolvedValue({
        id: campaignId,
        workspaceId,
      });
      mockPrismaService.post.findFirst.mockResolvedValue({
        id: postId,
        workspaceId,
        campaignId,
      });
      mockPrismaService.post.update.mockResolvedValue({});

      await service.removePost(workspaceId, campaignId, postId);

      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: { campaignId: null },
      });
    });
  });
});
