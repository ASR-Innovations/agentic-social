# AI Social Media Platform - Monorepo Setup Guide

## 📁 Project Structure

This is a monorepo containing both the backend (NestJS) and frontend (Next.js) applications for the AI-native social media management platform.

```
ai-social-media-platform/
├── src/                          # Backend (NestJS) source code
│   ├── auth/                     # Authentication module
│   ├── config/                   # Configuration files
│   ├── health/                   # Health check endpoints
│   ├── media/                    # Media management
│   ├── prisma/                   # Prisma service
│   ├── tenant/                   # Multi-tenancy
│   ├── user/                     # User management
│   └── main.ts                   # Application entry point
├── frontend/                     # Frontend (Next.js) application
│   ├── src/
│   │   ├── app/                  # Next.js 14 App Router pages
│   │   ├── components/           # React components
│   │   ├── lib/                  # Utility libraries
│   │   ├── store/                # State management (Zustand)
│   │   ├── styles/               # Global styles
│   │   └── types/                # TypeScript types
│   ├── public/                   # Static assets
│   └── package.json              # Frontend dependencies
├── prisma/                       # Prisma schema and migrations
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── docker-compose.yml            # Local development infrastructure
├── .env.example                  # Environment variables template
├── package.json                  # Backend dependencies
└── README.md                     # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Docker**: v24.x or higher (for local development)
- **Docker Compose**: v2.x or higher

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ai-social-media-platform

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DATABASE_URL
# - JWT_SECRET
# - REDIS_HOST
# - MONGODB_URI
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and MongoDB
docker-compose up -d postgres redis mongodb

# Verify services are running
docker-compose ps
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend (NestJS)
npm run start:dev

# Terminal 2: Start frontend (Next.js)
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/v1

## 🛠️ Development

### Backend (NestJS)

```bash
# Development mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend (Next.js)

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Lint code
npm run lint

# Run tests
npm run test
```

### Database Management

```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Deploy migrations to production
npm run prisma:migrate:deploy

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## 🐳 Docker Development

### Start All Services

```bash
# Start all services (PostgreSQL, Redis, MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: Deletes all data)
docker-compose down -v
```

### Individual Services

```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Start only Redis
docker-compose up -d redis

# Start only MongoDB
docker-compose up -d mongodb
```

### Production Build

```bash
# Build and start production containers
docker-compose --profile production up -d

# View production logs
docker-compose logs -f app
```

## 📝 Code Quality

### TypeScript Configuration

Both backend and frontend use **strict mode** TypeScript:
- Type safety enforced
- No implicit any
- Strict null checks
- Consistent casing

### ESLint

```bash
# Backend
npm run lint

# Frontend
cd frontend && npm run lint
```

### Prettier

```bash
# Backend
npm run format

# Frontend
cd frontend && npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
```

### Pre-commit Hooks (Recommended)

Install Husky for automatic linting and formatting:

```bash
# Install Husky
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

## 🔒 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://admin:pass@localhost:27017/db` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `AWS_ACCESS_KEY_ID` | AWS access key | Media storage |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Media storage |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | Media storage |
| `OPENAI_API_KEY` | OpenAI API key | AI features |
| `ANTHROPIC_API_KEY` | Anthropic API key | AI features |

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📦 Building for Production

### Backend

```bash
# Build
npm run build

# The compiled output will be in the dist/ directory
# Start production server
npm run start:prod
```

### Frontend

```bash
cd frontend

# Build
npm run build

# The optimized build will be in the .next/ directory
# Start production server
npm run start
```

## 🔍 Health Checks

The backend provides health check endpoints:

- `GET /api/v1/health` - Overall health status
- `GET /api/v1/health/ready` - Readiness probe (for Kubernetes)
- `GET /api/v1/health/live` - Liveness probe (for Kubernetes)

Example response:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "mongodb": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "mongodb": { "status": "up" }
  }
}
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Find process using port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
npm run prisma:generate

# If issues persist, clear node_modules
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
# Should return: PONG
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

[Your License Here]
