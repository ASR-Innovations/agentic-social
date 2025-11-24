# Developer Guide - AI-Native Social Media Management Platform

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Database Management](#database-management)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn
- PostgreSQL 16+
- Redis 7+
- MongoDB 7+
- Docker and Docker Compose (optional)
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/platform.git
cd platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start databases with Docker
docker-compose up -d postgres redis mongodb

# Run database migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed

# Start development servers
npm run dev
```

The backend will be available at `http://localhost:3000` and the frontend at `http://localhost:3001`.

---

## Architecture Overview

### Technology Stack

**Backend:**
- NestJS - Enterprise Node.js framework
- TypeScript - Type-safe development
- Prisma - Type-safe ORM
- PostgreSQL - Primary database
- Redis - Caching and queues
- MongoDB - Analytics and logs
- BullMQ - Background jobs
- Socket.io - Real-time features

**Frontend:**
- Next.js 14 - React framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- TanStack Query - Data fetching
- Zustand - State management
- Shadcn/ui - Component library

**AI/ML:**
- OpenAI GPT-4o/GPT-4o-mini
- Anthropic Claude 3.5 Sonnet/Haiku
- CrewAI - Multi-agent orchestration
- LangChain - LLM framework
- Hugging Face - Sentiment analysis

### System Architecture

```
┌─────────────┐
│   Frontend  │ (Next.js)
│   Port 3001 │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  API Gateway│
│   Port 3000 │
└──────┬──────┘
       │
       ├──→ Publishing Service
       ├──→ Analytics Service
       ├──→ Listening Service
       ├──→ Community Service
       ├──→ AI Coordinator
       └──→ Other Services
       
┌──────────────────────────┐
│  Data Layer              │
├──────────────────────────┤
│ PostgreSQL (Primary DB)  │
│ MongoDB (Analytics)      │
│ Redis (Cache/Queue)      │
│ S3 (Media Storage)       │
└──────────────────────────┘
```

---

## Development Setup

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/platform"
MONGODB_URI="mongodb://localhost:27017/platform"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"
REFRESH_TOKEN_SECRET="your-refresh-secret"
REFRESH_TOKEN_EXPIRES_IN="7d"

# AI APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Social Platform APIs
INSTAGRAM_CLIENT_ID="..."
INSTAGRAM_CLIENT_SECRET="..."
FACEBOOK_APP_ID="..."
FACEBOOK_APP_SECRET="..."
TWITTER_API_KEY="..."
TWITTER_API_SECRET="..."
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="platform-media"
AWS_REGION="us-east-1"

# Email
SENDGRID_API_KEY="..."
FROM_EMAIL="noreply@platform.com"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3000"
```

### Database Setup

```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Seed database with sample data
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Running in Development

```bash
# Start backend only
npm run start:dev

# Start frontend only
cd frontend && npm run dev

# Start both (recommended)
npm run dev

# Start with Docker Compose
docker-compose up
```

---

## Project Structure

```
platform/
├── src/                      # Backend source code
│   ├── ai/                   # AI services and agents
│   │   ├── agents/          # AI agent implementations
│   │   ├── services/        # AI coordination services
│   │   └── dto/             # Data transfer objects
│   ├── analytics/           # Analytics service
│   ├── auth/                # Authentication & authorization
│   ├── publishing/          # Content publishing service
│   ├── listening/           # Social listening service
│   ├── community/           # Inbox and community management
│   ├── campaign/            # Campaign management
│   ├── commerce/            # E-commerce integration
│   ├── influencer/          # Influencer management
│   ├── workflow/            # Approval workflows
│   ├── common/              # Shared utilities
│   ├── config/              # Configuration
│   └── main.ts              # Application entry point
├── frontend/                # Frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   ├── store/          # Zustand stores
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma       # Prisma schema
│   ├── migrations/         # Database migrations
│   └── seed.ts             # Database seeding
├── test/                    # Test files
├── docs/                    # Documentation
├── docker-compose.yml       # Docker services
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## Backend Development

### Creating a New Module

```bash
# Generate a new module with NestJS CLI
nest generate module features/my-feature
nest generate controller features/my-feature
nest generate service features/my-feature
```

### Module Structure

```typescript
// my-feature.module.ts
import { Module } from '@nestjs/common';
import { MyFeatureController } from './my-feature.controller';
import { MyFeatureService } from './my-feature.service';

@Module({
  imports: [],
  controllers: [MyFeatureController],
  providers: [MyFeatureService],
  exports: [MyFeatureService],
})
export class MyFeatureModule {}
```

### Creating a Controller

```typescript
// my-feature.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { MyFeatureService } from './my-feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';

@Controller('api/my-feature')
@UseGuards(JwtAuthGuard)
export class MyFeatureController {
  constructor(private readonly myFeatureService: MyFeatureService) {}

  @Get()
  async findAll() {
    return this.myFeatureService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.myFeatureService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateFeatureDto) {
    return this.myFeatureService.create(createDto);
  }
}
```

### Creating a Service

```typescript
// my-feature.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateFeatureDto } from './dto/create-feature.dto';

@Injectable()
export class MyFeatureService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.feature.findMany();
  }

  async findOne(id: string) {
    return this.prisma.feature.findUnique({
      where: { id },
    });
  }

  async create(data: CreateFeatureDto) {
    return this.prisma.feature.create({
      data,
    });
  }
}
```

### Data Transfer Objects (DTOs)

```typescript
// dto/create-feature.dto.ts
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
```

### Database Queries with Prisma

```typescript
// Find with relations
const post = await this.prisma.post.findUnique({
  where: { id },
  include: {
    author: true,
    media: true,
    platforms: true,
  },
});

// Find with filters
const posts = await this.prisma.post.findMany({
  where: {
    workspaceId,
    status: 'published',
    publishedAt: {
      gte: startDate,
      lte: endDate,
    },
  },
  orderBy: {
    publishedAt: 'desc',
  },
  take: 20,
  skip: offset,
});

// Create with relations
const post = await this.prisma.post.create({
  data: {
    content: { ... },
    workspace: {
      connect: { id: workspaceId },
    },
    author: {
      connect: { id: userId },
    },
    platforms: {
      create: [
        { platform: 'instagram', accountId: '...' },
        { platform: 'twitter', accountId: '...' },
      ],
    },
  },
});

// Update
await this.prisma.post.update({
  where: { id },
  data: {
    status: 'published',
    publishedAt: new Date(),
  },
});

// Delete
await this.prisma.post.delete({
  where: { id },
});
```

### Background Jobs with BullMQ

```typescript
// Creating a queue
import { Queue } from 'bullmq';

const publishQueue = new Queue('publish', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

// Adding a job
await publishQueue.add('publish-post', {
  postId: 'post_123',
  platforms: ['instagram', 'twitter'],
});

// Processing jobs
import { Worker } from 'bullmq';

const worker = new Worker('publish', async (job) => {
  const { postId, platforms } = job.data;
  
  for (const platform of platforms) {
    await publishToPlatform(postId, platform);
  }
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});
```

### Real-time Updates with Socket.io

```typescript
// Gateway
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitPostPublished(postId: string, data: any) {
    this.server.emit('post:published', { postId, data });
  }
}

// Using in service
constructor(private eventsGateway: EventsGateway) {}

async publishPost(postId: string) {
  // ... publish logic
  this.eventsGateway.emitPostPublished(postId, result);
}
```

---

## Frontend Development

### Creating a New Page

```typescript
// app/my-page/page.tsx
import { Metadata } from 'next';
import MyPageComponent from '@/components/MyPageComponent';

export const metadata: Metadata = {
  title: 'My Page',
  description: 'Description of my page',
};

export default function MyPage() {
  return <MyPageComponent />;
}
```

### Creating a Component

```typescript
// components/MyComponent.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
      {onAction && (
        <Button onClick={onAction} variant="outline">
          Action
        </Button>
      )}
    </div>
  );
}
```

### Data Fetching with TanStack Query

```typescript
// hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => api.get('/api/posts').then(res => res.data),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => 
      api.post('/api/posts', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Using in component
function PostsList() {
  const { data: posts, isLoading, error } = usePosts();
  const createPost = useCreatePost();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      <Button onClick={() => createPost.mutate({ ... })}>
        Create Post
      </Button>
    </div>
  );
}
```

### State Management with Zustand

```typescript
// store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Using in component
function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header>
      <span>Welcome, {user?.name}</span>
      <Button onClick={logout}>Logout</Button>
    </header>
  );
}
```

### Form Handling

```typescript
// components/CreatePostForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const postSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
});

type PostFormData = z.infer<typeof postSchema>;

export default function CreatePostForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const onSubmit = async (data: PostFormData) => {
    // Submit logic
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Textarea
          {...register('content')}
          placeholder="What's on your mind?"
        />
        {errors.content && (
          <p className="text-red-500 text-sm">{errors.content.message}</p>
        )}
      </div>

      <Button type="submit">Create Post</Button>
    </form>
  );
}
```

---

## Database Management

### Creating Migrations

```bash
# Create a new migration
npm run prisma:migrate:dev --name add_new_field

# Apply migrations
npm run prisma:migrate:deploy

# Reset database (development only)
npm run prisma:migrate:reset
```

### Prisma Schema Example

```prisma
// prisma/schema.prisma
model Post {
  id          String   @id @default(cuid())
  workspaceId String
  authorId    String
  content     Json
  status      PostStatus
  scheduledAt DateTime?
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  author      User      @relation(fields: [authorId], references: [id])
  platforms   PlatformPost[]
  media       MediaAsset[]

  @@index([workspaceId])
  @@index([status])
  @@index([scheduledAt])
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
  FAILED
}
```

### Seeding Data

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: 'demo',
      plan: 'professional',
    },
  });

  // Create user
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      workspaceId: workspace.id,
      role: 'owner',
    },
  });

  console.log({ workspace, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Testing

### Unit Tests

```typescript
// my-feature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MyFeatureService } from './my-feature.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('MyFeatureService', () => {
  let service: MyFeatureService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyFeatureService, PrismaService],
    }).compile();

    service = module.get<MyFeatureService>(MyFeatureService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a feature', async () => {
    const data = { name: 'Test Feature' };
    const result = { id: '1', ...data };

    jest.spyOn(prisma.feature, 'create').mockResolvedValue(result);

    expect(await service.create(data)).toEqual(result);
  });
});
```

### Integration Tests

```typescript
// my-feature.integration.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('MyFeature (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = response.body.accessToken;
  });

  it('/api/my-feature (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/my-feature')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

---

## Deployment

### Building for Production

```bash
# Build backend
npm run build

# Build frontend
cd frontend && npm run build

# Build Docker images
docker build -t platform-backend .
docker build -t platform-frontend ./frontend
```

### Environment Configuration

Production environment variables should be set in your hosting platform (AWS, GCP, Vercel, etc.).

### Database Migrations

```bash
# Run migrations in production
npm run prisma:migrate:deploy
```

### Docker Deployment

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: platform-backend:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - MONGODB_URI=${MONGODB_URI}
    depends_on:
      - postgres
      - redis
      - mongodb

  frontend:
    image: platform-frontend:latest
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}

  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

volumes:
  postgres_data:
  redis_data:
  mongo_data:
```

---

## Best Practices

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Error Handling

```typescript
// Use custom exceptions
import { HttpException, HttpStatus } from '@nestjs/common';

throw new HttpException('Post not found', HttpStatus.NOT_FOUND);

// Use try-catch for async operations
try {
  const result = await this.externalService.call();
  return result;
} catch (error) {
  this.logger.error('External service failed', error);
  throw new HttpException(
    'Service temporarily unavailable',
    HttpStatus.SERVICE_UNAVAILABLE
  );
}
```

### Logging

```typescript
import { Logger } from '@nestjs/common';

export class MyService {
  private readonly logger = new Logger(MyService.name);

  async doSomething() {
    this.logger.log('Starting operation');
    try {
      // ... operation
      this.logger.log('Operation completed successfully');
    } catch (error) {
      this.logger.error('Operation failed', error.stack);
      throw error;
    }
  }
}
```

### Security

- Always validate user input
- Use parameterized queries (Prisma handles this)
- Implement rate limiting
- Use HTTPS in production
- Store secrets in environment variables
- Implement proper authentication and authorization
- Sanitize user-generated content

### Performance

- Use database indexes
- Implement caching with Redis
- Use pagination for large datasets
- Optimize database queries
- Use CDN for static assets
- Implement lazy loading in frontend
- Use React.memo for expensive components

---

*For questions or contributions, see CONTRIBUTING.md*
