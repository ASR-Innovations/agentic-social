import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommerceModule } from './commerce.module';
import { PrismaService } from '../prisma/prisma.service';
import { CommercePlatform, ConversionType } from '@prisma/client';

describe('Commerce Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let workspaceId: string;
  let integrationId: string;
  let productId: string;
  let postId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommerceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Setup test data
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace-commerce',
        plan: 'PROFESSIONAL',
      },
    });
    workspaceId = workspace.id;

    const user = await prisma.user.create({
      data: {
        email: 'commerce-test@example.com',
        password: 'hashed-password',
        name: 'Commerce Test User',
        workspaceId,
        role: 'ADMIN',
      },
    });

    // Mock auth token (in real tests, you'd get this from auth endpoint)
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { workspaceId } });
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await app.close();
  });

  describe('Integration Management', () => {
    it('should create a Shopify integration', async () => {
      const response = await request(app.getHttpServer())
        .post('/commerce/integrations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          platform: CommercePlatform.SHOPIFY,
          storeName: 'Test Store',
          storeUrl: 'https://test-store.myshopify.com',
          storeDomain: 'test-store.myshopify.com',
          credentials: {
            shopDomain: 'test-store.myshopify.com',
            accessToken: 'test-token',
            apiVersion: '2024-01',
          },
          autoSync: true,
          syncFrequency: 60,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.platform).toBe(CommercePlatform.SHOPIFY);
      integrationId = response.body.id;
    });

    it('should list integrations', async () => {
      const response = await request(app.getHttpServer())
        .get('/commerce/integrations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get integration details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/commerce/integrations/${integrationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(integrationId);
    });
  });

  describe('Product Management', () => {
    it('should sync products from integration', async () => {
      const response = await request(app.getHttpServer())
        .post('/commerce/products/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          integrationId,
          fullSync: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('syncedCount');
    });

    it('should list products', async () => {
      const response = await request(app.getHttpServer())
        .get('/commerce/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ integrationId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      
      if (response.body.products.length > 0) {
        productId = response.body.products[0].id;
      }
    });

    it('should get product details', async () => {
      if (!productId) {
        return; // Skip if no products
      }

      const response = await request(app.getHttpServer())
        .get(`/commerce/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
    });
  });

  describe('Shoppable Posts', () => {
    beforeAll(async () => {
      // Create a test post
      const post = await prisma.post.create({
        data: {
          workspaceId,
          authorId: (await prisma.user.findFirst({ where: { workspaceId } }))!.id,
          content: { text: 'Test post with products' },
          status: 'DRAFT',
        },
      });
      postId = post.id;
    });

    it('should create a shoppable post', async () => {
      if (!productId) {
        return; // Skip if no products
      }

      const response = await request(app.getHttpServer())
        .post('/commerce/shoppable-posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          postId,
          productTags: [
            {
              productId,
              mediaIndex: 0,
              xPosition: 0.5,
              yPosition: 0.5,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.postId).toBe(postId);
    });

    it('should get shoppable post details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/commerce/shoppable-posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.postId).toBe(postId);
    });
  });

  describe('Conversion Tracking', () => {
    it('should track a conversion', async () => {
      const response = await request(app.getHttpServer())
        .post('/commerce/conversions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          postId,
          productId,
          platform: 'INSTAGRAM',
          conversionType: ConversionType.PURCHASE,
          orderValue: 99.99,
          currency: 'USD',
          orderId: 'test-order-123',
          utmSource: 'instagram',
          utmMedium: 'social',
          utmCampaign: 'test-campaign',
          purchasedAt: new Date().toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.conversionType).toBe(ConversionType.PURCHASE);
    });

    it('should get conversion funnel', async () => {
      const response = await request(app.getHttpServer())
        .get('/commerce/conversions/funnel')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('clicks');
      expect(response.body).toHaveProperty('views');
      expect(response.body).toHaveProperty('addToCarts');
      expect(response.body).toHaveProperty('purchases');
      expect(response.body).toHaveProperty('conversionRates');
    });
  });

  describe('Commerce Analytics', () => {
    it('should get commerce analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/commerce/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('analytics');
      expect(response.body).toHaveProperty('totals');
    });

    it('should get top products', async () => {
      const response = await request(app.getHttpServer())
        .get('/commerce/analytics/top-products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get commerce overview', async () => {
      const response = await request(app.getHttpServer())
        .get('/commerce/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('integrations');
      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('conversions');
      expect(response.body).toHaveProperty('topProducts');
    });
  });
});
