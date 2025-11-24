import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { VideoAnalyticsService } from './video-analytics.service';
import { VideoAnalytics } from './schemas/video-analytics.schema';

describe('VideoAnalyticsService', () => {
  let service: VideoAnalyticsService;

  const mockVideoAnalyticsModel = {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoAnalyticsService,
        {
          provide: getModelToken(VideoAnalytics.name),
          useValue: mockVideoAnalyticsModel,
        },
      ],
    }).compile();

    service = module.get<VideoAnalyticsService>(VideoAnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertAnalytics', () => {
    it('should create or update video analytics', async () => {
      const mockAnalytics = {
        videoId: 'video-1',
        workspaceId: 'workspace-1',
        postId: 'post-1',
        platform: 'youtube',
        views: 100,
        toObject: jest.fn().mockReturnThis(),
      };

      mockVideoAnalyticsModel.findOneAndUpdate.mockResolvedValue(mockAnalytics);

      const result = await service.upsertAnalytics(
        'video-1',
        'workspace-1',
        'post-1',
        'youtube',
        { views: 100 },
      );

      expect(mockVideoAnalyticsModel.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('trackView', () => {
    it('should track a video view', async () => {
      mockVideoAnalyticsModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockVideoAnalyticsModel.findOne.mockResolvedValue({
        views: 10,
        totalWatchTime: 300,
      });

      await service.trackView(
        'video-1',
        'workspace-1',
        'post-1',
        'youtube',
        30,
        true,
      );

      expect(mockVideoAnalyticsModel.updateOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('trackCompletion', () => {
    it('should track video completion', async () => {
      mockVideoAnalyticsModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockVideoAnalyticsModel.findOne.mockResolvedValue({
        views: 100,
        completions: 50,
      });

      await service.trackCompletion(
        'video-1',
        'workspace-1',
        'post-1',
        'youtube',
      );

      expect(mockVideoAnalyticsModel.updateOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('getVideoPerformance', () => {
    it('should return video performance metrics', async () => {
      const mockAnalytics = {
        videoId: 'video-1',
        workspaceId: 'workspace-1',
        views: 1000,
        uniqueViews: 800,
        averageWatchTime: 45,
        averageWatchPercentage: 75,
        completionRate: 60,
        likes: 100,
        comments: 50,
        shares: 25,
        saves: 15,
        clickThroughRate: 5,
        retentionCurve: [100, 95, 90, 85, 80],
        dropOffPoints: { '10': 5, '20': 10 },
        trafficSources: { organic: 500, social: 300, direct: 200 },
        deviceBreakdown: { mobile: 600, desktop: 300, tablet: 100 },
        geographicData: { US: 400, UK: 200, CA: 150 },
      };

      mockVideoAnalyticsModel.findOne.mockResolvedValue(mockAnalytics);

      const result = await service.getVideoPerformance('video-1', 'workspace-1');

      expect(result).toBeDefined();
      expect(result?.videoId).toBe('video-1');
      expect(result?.views).toBe(1000);
      expect(result?.engagementRate).toBeGreaterThan(0);
      expect(result?.topTrafficSources).toBeDefined();
      expect(result?.topCountries).toBeDefined();
    });

    it('should return null if analytics not found', async () => {
      mockVideoAnalyticsModel.findOne.mockResolvedValue(null);

      const result = await service.getVideoPerformance('video-1', 'workspace-1');

      expect(result).toBeNull();
    });
  });

  describe('getAverageMetrics', () => {
    it('should calculate average metrics for workspace', async () => {
      const mockAggregateResult = [
        {
          _id: null,
          averageViews: 500,
          averageCompletionRate: 65,
          averageWatchPercentage: 70,
          totalViews: 5000,
          totalEngagements: 500,
        },
      ];

      mockVideoAnalyticsModel.aggregate.mockResolvedValue(mockAggregateResult);

      const result = await service.getAverageMetrics('workspace-1');

      expect(result).toBeDefined();
      expect(result.averageViews).toBe(500);
      expect(result.averageCompletionRate).toBe(65);
      expect(result.averageEngagementRate).toBeGreaterThan(0);
    });

    it('should return zeros if no data exists', async () => {
      mockVideoAnalyticsModel.aggregate.mockResolvedValue([]);

      const result = await service.getAverageMetrics('workspace-1');

      expect(result.averageViews).toBe(0);
      expect(result.averageCompletionRate).toBe(0);
      expect(result.averageWatchPercentage).toBe(0);
      expect(result.averageEngagementRate).toBe(0);
    });
  });

  describe('getTopPerformingVideos', () => {
    it('should return top videos sorted by views', async () => {
      const mockVideos = [
        { videoId: 'video-1', views: 1000 },
        { videoId: 'video-2', views: 800 },
        { videoId: 'video-3', views: 600 },
      ];

      mockVideoAnalyticsModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockVideos),
          }),
        }),
      });

      const result = await service.getTopPerformingVideos('workspace-1', 3, 'views');

      expect(result).toHaveLength(3);
      expect(result[0].views).toBeGreaterThanOrEqual(result[1].views);
    });
  });
});
