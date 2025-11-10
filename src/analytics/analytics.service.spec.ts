import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './entities/analytics.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let repository: Repository<AnalyticsEvent>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(AnalyticsEvent),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    repository = module.get<Repository<AnalyticsEvent>>(getRepositoryToken(AnalyticsEvent));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordEvent', () => {
    it('should record an analytics event', async () => {
      const tenantId = 'tenant-123';
      const eventType = 'impressions';
      const value = 1000;
      const metadata = {
        postId: 'post-123',
        socialAccountId: 'account-123',
        platform: 'twitter',
      };

      const event = {
        id: 'event-123',
        tenantId,
        eventType,
        value,
        ...metadata,
      };

      mockRepository.create.mockReturnValue(event);
      mockRepository.save.mockResolvedValue(event);

      await service.recordEvent(tenantId, eventType, value, metadata);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId,
          eventType,
          value,
          postId: metadata.postId,
          socialAccountId: metadata.socialAccountId,
          platform: metadata.platform,
        }),
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('getPostAnalytics', () => {
    it('should calculate post analytics correctly', async () => {
      const tenantId = 'tenant-123';
      const postId = 'post-123';

      const events = [
        {
          eventType: 'impressions',
          value: 1000,
          platform: 'twitter',
        },
        {
          eventType: 'likes',
          value: 50,
          platform: 'twitter',
        },
        {
          eventType: 'comments',
          value: 10,
          platform: 'twitter',
        },
        {
          eventType: 'shares',
          value: 5,
          platform: 'twitter',
        },
        {
          eventType: 'clicks',
          value: 100,
          platform: 'twitter',
        },
        {
          eventType: 'impressions',
          value: 500,
          platform: 'instagram',
        },
        {
          eventType: 'likes',
          value: 75,
          platform: 'instagram',
        },
      ];

      mockRepository.find.mockResolvedValue(events);

      const result = await service.getPostAnalytics(tenantId, postId);

      expect(result.impressions).toBe(1500);
      expect(result.likes).toBe(125);
      expect(result.comments).toBe(10);
      expect(result.shares).toBe(5);
      expect(result.clicks).toBe(100);
      expect(result.engagement).toBeCloseTo(9.33, 2); // (125+10+5)/1500 * 100

      expect(result.byPlatform.twitter).toBeDefined();
      expect(result.byPlatform.twitter.impressions).toBe(1000);
      expect(result.byPlatform.twitter.likes).toBe(50);

      expect(result.byPlatform.instagram).toBeDefined();
      expect(result.byPlatform.instagram.impressions).toBe(500);
      expect(result.byPlatform.instagram.likes).toBe(75);
    });

    it('should handle zero impressions', async () => {
      const tenantId = 'tenant-123';
      const postId = 'post-123';

      const events = [
        {
          eventType: 'likes',
          value: 50,
          platform: 'twitter',
        },
      ];

      mockRepository.find.mockResolvedValue(events);

      const result = await service.getPostAnalytics(tenantId, postId);

      expect(result.engagement).toBe(0);
    });

    it('should handle empty events', async () => {
      const tenantId = 'tenant-123';
      const postId = 'post-123';

      mockRepository.find.mockResolvedValue([]);

      const result = await service.getPostAnalytics(tenantId, postId);

      expect(result.impressions).toBe(0);
      expect(result.likes).toBe(0);
      expect(result.comments).toBe(0);
      expect(result.shares).toBe(0);
      expect(result.clicks).toBe(0);
      expect(result.engagement).toBe(0);
    });
  });

  describe('getTenantAnalytics', () => {
    it('should calculate tenant-level analytics', async () => {
      const tenantId = 'tenant-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const events = [
        {
          postId: 'post-1',
          eventType: 'impressions',
          value: 1000,
          platform: 'twitter',
          recordedAt: new Date('2024-01-15'),
        },
        {
          postId: 'post-1',
          eventType: 'likes',
          value: 50,
          platform: 'twitter',
          recordedAt: new Date('2024-01-15'),
        },
        {
          postId: 'post-2',
          eventType: 'impressions',
          value: 500,
          platform: 'instagram',
          recordedAt: new Date('2024-01-20'),
        },
        {
          postId: 'post-2',
          eventType: 'likes',
          value: 100,
          platform: 'instagram',
          recordedAt: new Date('2024-01-20'),
        },
      ];

      mockRepository.find.mockResolvedValue(events);

      const result = await service.getTenantAnalytics(tenantId, startDate, endDate);

      expect(result.totalImpressions).toBe(1500);
      expect(result.totalEngagement).toBe(150);
      expect(result.totalPosts).toBe(2);
      expect(result.averageEngagementRate).toBeCloseTo(10, 2);

      expect(result.byPlatform.twitter).toBeDefined();
      expect(result.byPlatform.twitter.impressions).toBe(1000);
      expect(result.byPlatform.twitter.engagement).toBe(50);

      expect(result.byPlatform.instagram).toBeDefined();
      expect(result.byPlatform.instagram.impressions).toBe(500);
      expect(result.byPlatform.instagram.engagement).toBe(100);
    });

    it('should identify top posts', async () => {
      const tenantId = 'tenant-123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const events = [
        {
          postId: 'post-1',
          eventType: 'impressions',
          value: 1000,
          platform: 'twitter',
          recordedAt: new Date('2024-01-15'),
        },
        {
          postId: 'post-1',
          eventType: 'likes',
          value: 100,
          platform: 'twitter',
          recordedAt: new Date('2024-01-15'),
        },
        {
          postId: 'post-2',
          eventType: 'impressions',
          value: 500,
          platform: 'instagram',
          recordedAt: new Date('2024-01-20'),
        },
        {
          postId: 'post-2',
          eventType: 'likes',
          value: 50,
          platform: 'instagram',
          recordedAt: new Date('2024-01-20'),
        },
      ];

      mockRepository.find.mockResolvedValue(events);

      const result = await service.getTenantAnalytics(tenantId, startDate, endDate);

      expect(result.topPosts.length).toBeGreaterThan(0);
      expect(result.topPosts[0].postId).toBe('post-1');
      expect(result.topPosts[0].engagement).toBe(100);
    });
  });
});
