import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api/v1');

    await app.init();

    // Register and login to get token
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'posts@test.com',
        password: 'PostsTest123!',
        name: 'Posts User',
        companyName: 'Posts Company',
      });

    accessToken = registerResponse.body.access_token;
    tenantId = registerResponse.body.user.tenantId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/posts (POST)', () => {
    it('should create a new post', () => {
      return request(app.getHttpServer())
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post content',
          type: 'text',
          socialAccountIds: [],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Post');
          expect(res.body.status).toBe('draft');
        });
    });

    it('should reject post without title', () => {
      return request(app.getHttpServer())
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'Content without title',
          socialAccountIds: [],
        })
        .expect(400);
    });

    it('should create scheduled post', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();

      return request(app.getHttpServer())
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Scheduled Post',
          content: 'This post will be published later',
          type: 'text',
          socialAccountIds: [],
          scheduledAt: futureDate,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe('scheduled');
          expect(res.body.scheduledAt).toBeDefined();
        });
    });
  });

  describe('/api/v1/posts (GET)', () => {
    beforeAll(async () => {
      // Create some posts
      await request(app.getHttpServer())
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Post 1',
          content: 'Content 1',
          type: 'text',
          socialAccountIds: [],
        });

      await request(app.getHttpServer())
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Post 2',
          content: 'Content 2',
          type: 'text',
          socialAccountIds: [],
        });
    });

    it('should return list of posts', () => {
      return request(app.getHttpServer())
        .get('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('posts');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.posts)).toBe(true);
          expect(res.body.posts.length).toBeGreaterThan(0);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/posts?status=draft')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.posts.every((p: any) => p.status === 'draft')).toBe(true);
        });
    });

    it('should paginate results', () => {
      return request(app.getHttpServer())
        .get('/api/v1/posts?limit=1&offset=0')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.posts.length).toBeLessThanOrEqual(1);
        });
    });
  });

  describe('/api/v1/posts/:id (GET)', () => {
    let postId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Single Post',
          content: 'Single post content',
          type: 'text',
          socialAccountIds: [],
        });

      postId = response.body.id;
    });

    it('should return single post', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(postId);
          expect(res.body.title).toBe('Single Post');
        });
    });

    it('should return 404 for non-existent post', () => {
      return request(app.getHttpServer())
        .get('/api/v1/posts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/api/v1/posts/:id (PATCH)', () => {
    let postId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Post to Update',
          content: 'Original content',
          type: 'text',
          socialAccountIds: [],
        });

      postId = response.body.id;
    });

    it('should update post', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated content',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Title');
          expect(res.body.content).toBe('Updated content');
        });
    });
  });

  describe('/api/v1/posts/:id (DELETE)', () => {
    let postId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Post to Delete',
          content: 'This will be deleted',
          type: 'text',
          socialAccountIds: [],
        });

      postId = response.body.id;
    });

    it('should delete post', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });
  });

  describe('/api/v1/posts/:id/duplicate (POST)', () => {
    let postId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Post to Duplicate',
          content: 'Original content',
          type: 'text',
          socialAccountIds: [],
        });

      postId = response.body.id;
    });

    it('should duplicate post', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/posts/${postId}/duplicate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).not.toBe(postId);
          expect(res.body.title).toContain('(Copy)');
          expect(res.body.content).toBe('Original content');
          expect(res.body.status).toBe('draft');
        });
    });
  });

  describe('Authorization', () => {
    it('should reject unauthorized requests', () => {
      return request(app.getHttpServer())
        .get('/api/v1/posts')
        .expect(401);
    });
  });
});
