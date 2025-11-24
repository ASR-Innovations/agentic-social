import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from './tenant.module';
import { Tenant } from './entities/tenant.entity';
import { WorkspaceTemplate } from './entities/workspace-template.entity';
import { ClientPortalAccess } from './entities/client-portal-access.entity';
import { ClientPortalAccessLevel } from './dto/client-portal.dto';

describe('Multi-Workspace Management (Integration)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let workspaceId: string;
  let templateId: string;
  let clientAccessId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'test_db',
          entities: [Tenant, WorkspaceTemplate, ClientPortalAccess],
          synchronize: true,
        }),
        TenantModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock authentication - in real tests, you would authenticate properly
    authToken = 'mock-jwt-token';
    userId = 'test-user-id';
    workspaceId = 'test-workspace-id';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Workspace Switching', () => {
    it('should get all user workspaces', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workspaces/my-workspaces')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should switch to a different workspace', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/workspaces/switch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ workspaceId })
        .expect(200);

      expect(response.body).toHaveProperty('workspace');
    });

    it('should fail to switch to workspace without access', async () => {
      await request(app.getHttpServer())
        .post('/api/workspaces/switch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ workspaceId: 'non-existent-workspace' })
        .expect(403);
    });
  });

  describe('Cross-Workspace Analytics', () => {
    it('should get cross-workspace analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workspaces/analytics/cross-workspace')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('workspaces');
      expect(response.body).toHaveProperty('analytics');
      expect(response.body).toHaveProperty('summary');
    });

    it('should filter analytics by workspace IDs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workspaces/analytics/cross-workspace')
        .query({ workspaceIds: [workspaceId] })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.workspaces.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Agency Dashboard', () => {
    it('should get agency dashboard data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workspaces/agency-dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('overview');
      expect(response.body).toHaveProperty('workspaces');
      expect(response.body).toHaveProperty('performanceMetrics');
      expect(response.body.overview).toHaveProperty('totalWorkspaces');
      expect(response.body.overview).toHaveProperty('totalClients');
    });
  });

  describe('Workspace Templates', () => {
    it('should create a workspace template', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/workspaces/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'E-commerce Starter',
          description: 'Pre-configured workspace for e-commerce',
          config: {
            settings: { timezone: 'UTC' },
            branding: { primaryColor: '#007bff' },
          },
          isPublic: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('E-commerce Starter');
      templateId = response.body.id;
    });

    it('should get all available templates', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/workspaces/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get a specific template', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/workspaces/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(templateId);
    });

    it('should apply template to workspace', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/workspaces/templates/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          templateId,
          workspaceId,
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });

    it('should delete a template', async () => {
      await request(app.getHttpServer())
        .delete(`/api/workspaces/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Client Portal Access', () => {
    it('should create client portal access', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/workspaces/${workspaceId}/client-portal`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'client@example.com',
          name: 'Test Client',
          workspaceId,
          accessLevel: ClientPortalAccessLevel.VIEW_AND_APPROVE,
          permissions: ['view_analytics', 'approve_posts'],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('client@example.com');
      expect(response.body).toHaveProperty('inviteToken');
      clientAccessId = response.body.id;
    });

    it('should get all client portal accesses for workspace', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/workspaces/${workspaceId}/client-portal`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update client portal access', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/workspaces/client-portal/${clientAccessId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accessLevel: ClientPortalAccessLevel.VIEW_ONLY,
        })
        .expect(200);

      expect(response.body.accessLevel).toBe(ClientPortalAccessLevel.VIEW_ONLY);
    });

    it('should verify client portal token', async () => {
      // First get the token
      const accessResponse = await request(app.getHttpServer())
        .get(`/api/workspaces/${workspaceId}/client-portal`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const token = accessResponse.body[0]?.inviteToken;

      if (token) {
        const response = await request(app.getHttpServer())
          .get(`/api/workspaces/client-portal/verify/${token}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('workspace');
      }
    });

    it('should revoke client portal access', async () => {
      await request(app.getHttpServer())
        .delete(`/api/workspaces/client-portal/${clientAccessId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should fail to create duplicate client access', async () => {
      // Create first access
      await request(app.getHttpServer())
        .post(`/api/workspaces/${workspaceId}/client-portal`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'duplicate@example.com',
          name: 'Duplicate Client',
          workspaceId,
          accessLevel: ClientPortalAccessLevel.VIEW_ONLY,
        })
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post(`/api/workspaces/${workspaceId}/client-portal`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'duplicate@example.com',
          name: 'Duplicate Client',
          workspaceId,
          accessLevel: ClientPortalAccessLevel.VIEW_ONLY,
        })
        .expect(400);
    });
  });
});
