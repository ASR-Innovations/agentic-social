import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IntegrationModule } from './integration.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Integration Framework (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let workspaceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IntegrationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create test workspace and user for authentication
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: 'test-workspace-integration',
        plan: 'PROFESSIONAL',
      },
    });
    workspaceId = workspace.id;

    // Mock auth token (in real tests, you'd get this from auth service)
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.workspace.delete({ where: { id: workspaceId } });
    await app.close();
  });

  describe('Integration Management', () => {
    it('should create a new integration', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/integrations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Integration',
          type: 'ZAPIER',
          provider: 'zapier',
          description: 'Test integration for Zapier',
          scopes: ['read', 'write'],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Integration');
      expect(response.body.type).toBe('ZAPIER');
    });

    it('should list all integrations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/integrations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get marketplace integrations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/integrations/marketplace');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Webhook Management', () => {
    it('should create a new webhook', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/integrations/webhooks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Webhook',
          url: 'https://example.com/webhook',
          events: ['POST_PUBLISHED', 'POST_FAILED'],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('secret');
      expect(response.body.name).toBe('Test Webhook');
    });

    it('should list all webhooks', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/integrations/webhooks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('API Key Management', () => {
    it('should create a new API key', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/integrations/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test API Key',
          scopes: ['posts:read', 'posts:write'],
          rateLimitPerHour: 1000,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('key');
      expect(response.body.key).toMatch(/^sk_live_/);
    });

    it('should list all API keys', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/integrations/api-keys')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
