import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/user/entities/user.entity';
import { Tenant } from '../src/tenant/entities/tenant.entity';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let userRepository: any;
  let tenantRepository: any;

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

    userRepository = moduleFixture.get(getRepositoryToken(User));
    tenantRepository = moduleFixture.get(getRepositoryToken(Tenant));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    if (userRepository && tenantRepository) {
      await userRepository.query('DELETE FROM users');
      await tenantRepository.query('DELETE FROM tenants');
    }
  });

  describe('/api/v1/auth/register (POST)', () => {
    it('should register a new user and tenant', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@testcompany.com',
          password: 'SecurePass123!',
          name: 'Admin User',
          companyName: 'Test Company',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toBe('admin@testcompany.com');
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should reject registration with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          name: 'Test User',
          companyName: 'Test Company',
        })
        .expect(400);
    });

    it('should reject registration with short password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
          companyName: 'Test Company',
        })
        .expect(400);
    });

    it('should reject registration with missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    beforeEach(async () => {
      // Register a user first
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'login@test.com',
          password: 'LoginPass123!',
          name: 'Login User',
          companyName: 'Login Company',
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'LoginPass123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user.email).toBe('login@test.com');
        });
    });

    it('should reject login with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should reject login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'SomePassword',
        })
        .expect(401);
    });
  });

  describe('/api/v1/auth/profile (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'profile@test.com',
          password: 'ProfilePass123!',
          name: 'Profile User',
          companyName: 'Profile Company',
        });

      accessToken = response.body.access_token;
    });

    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('profile@test.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
