import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignStatus } from '@prisma/client';

describe('Campaign Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let workspaceId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create test workspace and user
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace-' + Date.now(),
      },
    });
    workspaceId = workspace.id;

    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'Test User',
        workspaceId,
      },
    });
    userId = user.id;

    // Get auth token (simplified - in real tests you'd call the auth endpoint)
    const authResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: 'password123',
      });

    // For this test, we'll mock the token
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.campaign.deleteMany({ where: { workspaceId } });
    await prisma.user.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await app.close();
  });

  describe('POST /campaigns', () => {
    it('should create a new campaign', async () => {
      const createDto = {
        name: 'Summer Sale 2024',
        description: 'Summer promotional campaign',
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-08-31T23:59:59Z',
        budget: 5000,
        tags: ['summer', 'sale'],
        goals: [
          { metric: 'reach', target: 100000 },
          { metric: 'engagement', target: 5000 },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createDto.name,
        description: createDto.description,
        status: CampaignStatus.DRAFT,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.utmParams).toBeDefined();
    });

    it('should reject campaign with invalid dates', async () => {
      const createDto = {
        name: 'Invalid Campaign',
        startDate: '2024-08-31T00:00:00Z',
        endDate: '2024-06-01T00:00:00Z',
      };

      await request(app.getHttpServer())
        .post('/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /campaigns', () => {
    let campaignId: string;

    beforeEach(async () => {
      const campaign = await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          workspaceId,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          status: CampaignStatus.ACTIVE,
          tags: ['test'],
        },
      });
      campaignId = campaign.id;
    });

    afterEach(async () => {
      await prisma.campaign.deleteMany({ where: { workspaceId } });
    });

    it('should return all campaigns for workspace', async () => {
      const response = await request(app.getHttpServer())
        .get('/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.campaigns).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.page).toBe(1);
    });

    it('should filter campaigns by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/campaigns')
        .query({ status: CampaignStatus.ACTIVE })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.campaigns).toBeInstanceOf(Array);
      response.body.campaigns.forEach((campaign: any) => {
        expect(campaign.status).toBe(CampaignStatus.ACTIVE);
      });
    });

    it('should search campaigns by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/campaigns')
        .query({ search: 'Test' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.campaigns).toBeInstanceOf(Array);
      expect(response.body.campaigns.length).toBeGreaterThan(0);
    });
  });

  describe('GET /campaigns/:id', () => {
    let campaignId: string;

    beforeEach(async () => {
      const campaign = await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          workspaceId,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
        },
      });
      campaignId = campaign.id;
    });

    afterEach(async () => {
      await prisma.campaign.deleteMany({ where: { id: campaignId } });
    });

    it('should return a campaign by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(campaignId);
      expect(response.body.name).toBe('Test Campaign');
    });

    it('should return 404 for non-existent campaign', async () => {
      await request(app.getHttpServer())
        .get('/campaigns/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /campaigns/:id', () => {
    let campaignId: string;

    beforeEach(async () => {
      const campaign = await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          workspaceId,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          status: CampaignStatus.DRAFT,
        },
      });
      campaignId = campaign.id;
    });

    afterEach(async () => {
      await prisma.campaign.deleteMany({ where: { id: campaignId } });
    });

    it('should update a campaign', async () => {
      const updateDto = {
        name: 'Updated Campaign',
        status: CampaignStatus.ACTIVE,
      };

      const response = await request(app.getHttpServer())
        .patch(`/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.status).toBe(updateDto.status);
    });
  });

  describe('DELETE /campaigns/:id', () => {
    it('should delete a campaign without posts', async () => {
      const campaign = await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          workspaceId,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
        },
      });

      await request(app.getHttpServer())
        .delete(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const deleted = await prisma.campaign.findUnique({
        where: { id: campaign.id },
      });
      expect(deleted).toBeNull();
    });
  });

  describe('Campaign-Post Association', () => {
    let campaignId: string;
    let postId: string;

    beforeEach(async () => {
      const campaign = await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          workspaceId,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
        },
      });
      campaignId = campaign.id;

      const post = await prisma.post.create({
        data: {
          workspaceId,
          authorId: userId,
          content: { text: 'Test post' },
          status: 'DRAFT',
        },
      });
      postId = post.id;
    });

    afterEach(async () => {
      await prisma.post.deleteMany({ where: { id: postId } });
      await prisma.campaign.deleteMany({ where: { id: campaignId } });
    });

    it('should associate a post with a campaign', async () => {
      await request(app.getHttpServer())
        .post(`/campaigns/${campaignId}/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const post = await prisma.post.findUnique({ where: { id: postId } });
      expect(post?.campaignId).toBe(campaignId);
    });

    it('should remove a post from a campaign', async () => {
      // First associate
      await prisma.post.update({
        where: { id: postId },
        data: { campaignId },
      });

      // Then remove
      await request(app.getHttpServer())
        .delete(`/campaigns/${campaignId}/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const post = await prisma.post.findUnique({ where: { id: postId } });
      expect(post?.campaignId).toBeNull();
    });
  });

  describe('GET /campaigns/:id/analytics', () => {
    let campaignId: string;

    beforeEach(async () => {
      const campaign = await prisma.campaign.create({
        data: {
          name: 'Test Campaign',
          workspaceId,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          goals: [
            { metric: 'reach', target: 100000, current: 50000 },
            { metric: 'engagement', target: 5000, current: 3000 },
          ] as any,
        },
      });
      campaignId = campaign.id;
    });

    afterEach(async () => {
      await prisma.campaign.deleteMany({ where: { id: campaignId } });
    });

    it('should return campaign analytics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/campaigns/${campaignId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        campaignId,
        campaignName: 'Test Campaign',
        metrics: expect.any(Object),
        goals: expect.any(Array),
        topPerformingPosts: expect.any(Array),
        platformBreakdown: expect.any(Array),
        timeline: expect.any(Array),
      });
    });
  });
});
