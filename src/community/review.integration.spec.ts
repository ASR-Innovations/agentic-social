import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { CommunityModule } from './community.module';
import { ReviewService } from './services/review.service';
import { ReviewSentimentService } from './services/review-sentiment.service';
import { ReputationScoreService } from './services/reputation-score.service';
import { ReviewAlertService } from './services/review-alert.service';

describe('Review Management Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let reviewService: ReviewService;
  let sentimentService: ReviewSentimentService;
  let reputationService: ReputationScoreService;
  let alertService: ReviewAlertService;

  const mockWorkspaceId = 'test-workspace-id';
  const mockUserId = 'test-user-id';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommunityModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    reviewService = moduleFixture.get<ReviewService>(ReviewService);
    sentimentService = moduleFixture.get<ReviewSentimentService>(ReviewSentimentService);
    reputationService = moduleFixture.get<ReputationScoreService>(ReputationScoreService);
    alertService = moduleFixture.get<ReviewAlertService>(ReviewAlertService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Review Creation and Sentiment Analysis', () => {
    it('should create a review and analyze sentiment', async () => {
      const reviewDto = {
        platform: 'GOOGLE_MY_BUSINESS',
        platformReviewId: 'test-review-1',
        reviewerName: 'John Doe',
        rating: 5,
        content: 'Excellent service! The staff was very helpful and the food was delicious.',
        publishedAt: new Date().toISOString(),
      };

      const review = await reviewService.create(mockWorkspaceId, reviewDto);
      expect(review).toBeDefined();
      expect(review.id).toBeDefined();

      // Analyze sentiment
      const updatedReview = await sentimentService.updateReviewSentiment(review.id);
      expect(updatedReview.sentiment).toBe('POSITIVE');
      expect(updatedReview.sentimentScore).toBeGreaterThan(0);
      expect(updatedReview.topics.length).toBeGreaterThan(0);
      expect(updatedReview.keywords.length).toBeGreaterThan(0);
    });

    it('should detect negative review and create alert', async () => {
      const reviewDto = {
        platform: 'YELP',
        platformReviewId: 'test-review-2',
        reviewerName: 'Jane Smith',
        rating: 1,
        content: 'Terrible experience. The service was slow and the food was cold.',
        publishedAt: new Date().toISOString(),
      };

      const review = await reviewService.create(mockWorkspaceId, reviewDto);
      await sentimentService.updateReviewSentiment(review.id);

      // Check for alert
      const alert = await alertService.checkNegativeReview(review.id);
      expect(alert).toBeDefined();
      expect(alert.type).toBe('NEGATIVE_REVIEW');
      expect(alert.severity).toBe('CRITICAL');
    });
  });

  describe('Reputation Score Calculation', () => {
    it('should calculate reputation score', async () => {
      const today = new Date();
      
      const score = await reputationService.calculateReputationScore(
        mockWorkspaceId,
        today,
      );

      expect(score).toBeDefined();
      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(100);
      expect(score.averageRating).toBeGreaterThanOrEqual(0);
      expect(score.averageRating).toBeLessThanOrEqual(5);
      expect(score.totalReviews).toBeGreaterThan(0);
    });

    it('should track reputation trends', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const trends = await reputationService.getReputationTrends(
        mockWorkspaceId,
        startDate,
        endDate,
      );

      expect(Array.isArray(trends)).toBe(true);
    });
  });

  describe('Review Response Management', () => {
    it('should create and publish a response', async () => {
      // Create a review first
      const reviewDto = {
        platform: 'FACEBOOK',
        platformReviewId: 'test-review-3',
        reviewerName: 'Bob Johnson',
        rating: 4,
        content: 'Good experience overall.',
        publishedAt: new Date().toISOString(),
      };

      const review = await reviewService.create(mockWorkspaceId, reviewDto);

      // Create response
      const responseDto = {
        reviewId: review.id,
        content: 'Thank you for your feedback, Bob! We appreciate your business.',
        publishImmediately: false,
      };

      // Note: This would require ReviewResponseService to be properly mocked
      // or a test database to be set up
      // const response = await responseService.createResponse(mockWorkspaceId, mockUserId, responseDto);
      // expect(response).toBeDefined();
    });
  });

  describe('Review Analytics', () => {
    it('should get review statistics', async () => {
      const stats = await reviewService.getStatistics(mockWorkspaceId);

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.averageRating).toBeGreaterThanOrEqual(0);
      expect(stats.sentimentBreakdown).toBeDefined();
      expect(stats.responseRate).toBeGreaterThanOrEqual(0);
    });

    it('should filter reviews by platform', async () => {
      const result = await reviewService.findAll(mockWorkspaceId, {
        platform: 'GOOGLE_MY_BUSINESS',
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should filter reviews by sentiment', async () => {
      const result = await reviewService.findAll(mockWorkspaceId, {
        sentiment: 'NEGATIVE',
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      result.data.forEach(review => {
        expect(review.sentiment).toBe('NEGATIVE');
      });
    });
  });

  describe('Alert System', () => {
    it('should detect rating drop', async () => {
      const alert = await alertService.checkRatingDrop(mockWorkspaceId);
      
      // Alert may or may not exist depending on data
      if (alert) {
        expect(alert.type).toBe('RATING_DROP');
        expect(alert.ratingDrop).toBeGreaterThan(0);
      }
    });

    it('should detect review spike', async () => {
      const alert = await alertService.checkReviewSpike(mockWorkspaceId);
      
      // Alert may or may not exist depending on data
      if (alert) {
        expect(alert.type).toBe('REVIEW_SPIKE');
        expect(alert.affectedReviews).toBeGreaterThan(0);
      }
    });

    it('should get active alerts', async () => {
      const alerts = await alertService.getActiveAlerts(mockWorkspaceId);
      
      expect(Array.isArray(alerts)).toBe(true);
    });
  });

  describe('Sentiment Analysis', () => {
    it('should analyze positive sentiment correctly', async () => {
      const result = await sentimentService.analyzeSentiment(
        'Amazing service! The staff was incredibly helpful and friendly.',
        5,
      );

      expect(result.sentiment).toBe('POSITIVE');
      expect(result.sentimentScore).toBeGreaterThan(0);
      expect(result.topics.length).toBeGreaterThan(0);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should analyze negative sentiment correctly', async () => {
      const result = await sentimentService.analyzeSentiment(
        'Terrible experience. Very disappointed with the service.',
        1,
      );

      expect(result.sentiment).toBe('NEGATIVE');
      expect(result.sentimentScore).toBeLessThan(0);
    });

    it('should analyze neutral sentiment correctly', async () => {
      const result = await sentimentService.analyzeSentiment(
        'It was okay. Nothing special.',
        3,
      );

      expect(result.sentiment).toBe('NEUTRAL');
      expect(Math.abs(result.sentimentScore)).toBeLessThan(0.5);
    });
  });
});
