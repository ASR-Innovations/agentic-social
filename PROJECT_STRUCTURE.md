# AI Social Media Platform - Project Structure

## Overview

This is a monorepo containing a full-stack AI-powered social media management platform with:
- **Backend**: NestJS REST API with Prisma ORM
- **Frontend**: Next.js 14 with App Router
- **Infrastructure**: PostgreSQL, Redis, MongoDB via Docker Compose

## Directory Structure

```
ai-social-media-platform/
├── .kiro/                          # Kiro specs and documentation
│   └── specs/
│       └── ai-social-media-platform/
│           ├── requirements.md     # Feature requirements
│           ├── design.md          # System design
│           └── tasks.md           # Implementation tasks
│
├── frontend/                       # Next.js 14 frontend application
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   ├── components/            # React components
│   │   ├── lib/                   # Utilities and helpers
│   │   ├── store/                 # Zustand state management
│   │   ├── styles/                # Global styles
│   │   └── types/                 # TypeScript types
│   ├── public/                    # Static assets
│   ├── package.json
│   └── tsconfig.json
│
├── src/                           # Backend NestJS application
│   ├── auth/                      # Authentication module
│   ├── config/                    # Configuration files
│   │   ├── database.config.ts    # TypeORM config (legacy)
│   │   ├── redis.config.ts       # Redis/Bull config
│   │   └── env.validation.ts     # Environment validation
│   ├── health/                    # Health check endpoints
│   │   ├── health.controller.ts
│   │   ├── health.service.ts
│   │   └── health.module.ts
│   ├── media/                     # Media management
│   ├── prisma/                    # Prisma service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── social-account/            # Social account entities
│   ├── tenant/                    # Multi-tenancy (workspace)
│   ├── user/                      # User management
│   ├── app.module.ts              # Root application module
│   └── main.ts                    # Application entry point
│
├── prisma/                        # Prisma ORM
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
│       ├── migration_lock.toml
│       └── 20240101000000_initial_schema/
│           └── migration.sql
│
├── scripts/                       # Utility scripts
│   ├── verify-setup.js
│   └── verify-infrastructure.sh
│
├── docker-compose.yml             # Docker services configuration
├── Dockerfile                     # Backend Docker image
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── .gitignore                    # Git ignore rules
├── package.json                  # Backend dependencies
├── tsconfig.json                 # TypeScript configuration
├── nest-cli.json                 # NestJS CLI configuration
├── SETUP.md                      # Setup instructions
└── README.md                     # Project overview
```

## Technology Stack

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript 5.1+
- **ORM**: Prisma 5.7 (Primary), TypeORM 0.3 (Legacy)
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Analytics DB**: MongoDB 7
- **Authentication**: JWT with Passport
- **File Upload**: AWS S3 with Multer
- **Job Queue**: BullMQ

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.3
- **UI Components**: Shadcn/ui, Radix UI
- **State Management**: Zustand 4.4
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts 2.8
- **Real-time**: Socket.io Client

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Databases**: PostgreSQL, MongoDB, Redis
- **Cloud Storage**: AWS S3
- **CDN**: CloudFront (optional)

## Core Modules

### Backend Modules

#### 1. Health Module (`src/health/`)
- Health check endpoints for monitoring
- Database connectivity checks
- Redis and MongoDB status
- Endpoints: `/health`, `/health/ready`, `/health/live`

#### 2. Prisma Module (`src/prisma/`)
- Global Prisma Client service
- Database connection management
- Automatic connection lifecycle

#### 3. Auth Module (`src/auth/`)
- User registration and login
- JWT token generation and validation
- Refresh token rotation
- Password hashing with bcrypt

#### 4. User Module (`src/user/`)
- User CRUD operations
- User profile management
- Role-based access control

#### 5. Tenant Module (`src/tenant/`)
- Workspace management
- Multi-tenancy support
- Plan and billing management

#### 6. Media Module (`src/media/`)
- File upload to S3
- Media library management
- Image optimization

### Frontend Pages

#### 1. Dashboard (`/app/dashboard`)
- Overview metrics and KPIs
- Engagement charts
- Top-performing posts
- Quick actions

#### 2. Content Calendar (`/app/content`)
- Visual calendar for scheduling
- Drag-and-drop post management
- Multi-platform publishing

#### 3. AI Hub (`/app/ai-hub`)
- AI content generation
- Brand voice training
- Automation settings

#### 4. Analytics (`/app/analytics`)
- Performance metrics
- Custom reports
- Competitive analysis

#### 5. Inbox (`/app/inbox`)
- Unified social inbox
- Message management
- Conversation threading

#### 6. Listening (`/app/listening`)
- Brand monitoring
- Sentiment analysis
- Trend detection

#### 7. Media Library (`/app/media`)
- Asset management
- File organization
- Media editing

#### 8. Team (`/app/team`)
- Team member management
- Role assignment
- Permissions

#### 9. Settings (`/app/settings`)
- Account settings
- Social account connections
- Integrations

## Database Schema

### Core Tables (Prisma)

1. **workspaces** - Tenant/workspace management
2. **users** - User accounts and authentication
3. **user_permissions** - Granular permissions
4. **social_accounts** - Connected social media accounts
5. **posts** - Content items
6. **platform_posts** - Platform-specific post data
7. **media_assets** - Media library
8. **post_media** - Post-media relationships
9. **campaigns** - Campaign management
10. **conversations** - Social inbox conversations
11. **messages** - Individual messages
12. **workflows** - Approval and automation workflows
13. **approvals** - Content approval tracking

### Enums

- **UserRole**: OWNER, ADMIN, MANAGER, EDITOR, VIEWER
- **WorkspacePlan**: FREE, STARTER, PROFESSIONAL, ENTERPRISE
- **Platform**: INSTAGRAM, FACEBOOK, TWITTER, LINKEDIN, TIKTOK, YOUTUBE, PINTEREST, THREADS, REDDIT
- **PostStatus**: DRAFT, PENDING_APPROVAL, APPROVED, SCHEDULED, PUBLISHING, PUBLISHED, FAILED, ARCHIVED
- **ConversationType**: COMMENT, DM, MENTION, REVIEW
- **Sentiment**: POSITIVE, NEUTRAL, NEGATIVE

## Environment Variables

### Required Variables

```bash
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_social_platform
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ai_social_platform

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/ai_social_analytics?authSource=admin

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### Optional Variables (for future features)

```bash
# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket

# AI Services
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key

# Social Media APIs
INSTAGRAM_CLIENT_ID=your-id
TWITTER_API_KEY=your-key
LINKEDIN_CLIENT_ID=your-id
```

## API Endpoints

### Health Checks
- `GET /health` - Overall system health
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get current user

### Users
- `GET /users` - List users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Tenants (Workspaces)
- `GET /tenants` - List workspaces
- `GET /tenants/:id` - Get workspace
- `POST /tenants` - Create workspace
- `PATCH /tenants/:id` - Update workspace

### Media
- `POST /media/upload` - Upload file
- `GET /media` - List media assets
- `DELETE /media/:id` - Delete media

## Development Workflow

### 1. Initial Setup
```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Start infrastructure
docker compose up -d postgres redis mongodb

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 2. Development
```bash
# Terminal 1: Backend
npm run start:dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 3. Database Management
```bash
# Open Prisma Studio
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database (WARNING: deletes data)
npx prisma migrate reset
```

### 4. Code Quality
```bash
# Lint code
npm run lint
cd frontend && npm run lint

# Format code
npm run format
cd frontend && npm run format

# Type check
npm run build
cd frontend && npm run type-check
```

## Next Steps

1. ✅ Task 1: Project Setup and Core Infrastructure (COMPLETED)
2. Task 2: Database Schema Implementation
3. Task 3: Authentication System
4. Task 4: Authorization and RBAC
5. Continue with remaining tasks in `.kiro/specs/ai-social-media-platform/tasks.md`

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Requirements Document](.kiro/specs/ai-social-media-platform/requirements.md)
- [Design Document](.kiro/specs/ai-social-media-platform/design.md)
- [Tasks Document](.kiro/specs/ai-social-media-platform/tasks.md)
