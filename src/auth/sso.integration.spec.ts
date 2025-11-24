import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from './auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { SSOProvider } from './dto/sso-config.dto';

describe('SSO Integration (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let workspaceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('SSO Configuration Management', () => {
    it('should create SSO configuration', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sso/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          provider: SSOProvider.GOOGLE,
          tenantId: workspaceId,
          enabled: true,
          clientId: 'test-google-client-id',
          clientSecret: 'test-google-client-secret',
          redirectUri: 'http://localhost:3001/auth/sso/google/callback',
        });

      expect(response.status).toBe(201);
      expect(response.body.provider).toBe(SSOProvider.GOOGLE);
      expect(response.body.hasClientSecret).toBe(true);
    });
  });
});
