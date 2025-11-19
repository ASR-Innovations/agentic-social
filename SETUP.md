# AI Social Media Platform - Setup Guide

## Project Structure

This is a monorepo containing:
- **Backend**: NestJS application (root directory)
- **Frontend**: Next.js 14 application (frontend directory)

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- Git

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and MongoDB
docker-compose up -d postgres redis mongodb

# Verify services are running
docker-compose ps
```

### 3. Configure Environment Variables

```bash
# Copy example environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# Edit .env files with your configuration
# The default values work for local development
```

### 4. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend (port 3001)
npm run start:dev

# Terminal 2: Start frontend (port 3000)
cd frontend && npm run dev
```

## Available Scripts

### Backend (Root Directory)

```bash
npm run start:dev          # Start backend in watch mode
npm run build              # Build backend for production
npm run start:prod         # Start production build
npm run lint               # Lint backend code
npm run format             # Format backend code
npm run test               # Run backend tests
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio
```

### Frontend

```bash
cd frontend
npm run dev                # Start frontend dev server
npm run build              # Build frontend for production
npm run start              # Start production build
npm run lint               # Lint frontend code
npm run type-check         # TypeScript type checking
```

### Docker Commands

```bash
docker-compose up -d                    # Start all services
docker-compose up -d postgres redis     # Start specific services
docker-compose down                     # Stop all services
docker-compose logs -f                  # View logs
docker-compose ps                       # List running services
```

## Environment Variables

### Backend (.env)

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST`, `REDIS_PORT`: Redis configuration
- `JWT_SECRET`: Secret key for JWT tokens

Optional (for future features):
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key
- Social media API credentials

### Frontend (frontend/.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Database Schema

The Prisma schema includes:
- User and Workspace management
- Social account connections
- Post and content management
- Campaign tracking
- Community management (conversations, messages)
- Workflow and approval system

View the schema: `prisma/schema.prisma`

## Health Checks

Once the backend is running, check system health:

```bash
# Overall health check
curl http://localhost:3001/health

# Readiness check
curl http://localhost:3001/health/ready

# Liveness check
curl http://localhost:3001/health/live
```

## Troubleshooting

### Port Already in Use

If ports 3000, 3001, 5432, 6379, or 27017 are in use:

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
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

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Regenerate Prisma Client
npm run prisma:generate
```

## Development Workflow

1. Create a new feature branch
2. Make changes to backend or frontend
3. Run linting and tests
4. Commit changes
5. Create pull request

## Next Steps

After setup is complete:
- Review the requirements document: `.kiro/specs/ai-social-media-platform/requirements.md`
- Review the design document: `.kiro/specs/ai-social-media-platform/design.md`
- Check the implementation tasks: `.kiro/specs/ai-social-media-platform/tasks.md`
- Start implementing features according to the task list

## Support

For issues or questions, refer to:
- Project documentation in `.kiro/specs/`
- Prisma documentation: https://www.prisma.io/docs
- NestJS documentation: https://docs.nestjs.com
- Next.js documentation: https://nextjs.org/docs
