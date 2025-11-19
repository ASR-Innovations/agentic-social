# Quick Start Guide - AI Social Media Platform

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 20+ installed
- Docker installed (optional, but recommended)

### Step 1: Install Dependencies (2 min)
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### Step 2: Start Infrastructure (1 min)
```bash
# Start PostgreSQL, Redis, and MongoDB
docker compose up -d postgres redis mongodb

# Verify services are running
docker compose ps
```

**No Docker?** You can install PostgreSQL, Redis, and MongoDB locally or use cloud services.

### Step 3: Set Up Database (1 min)
```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### Step 4: Start Development Servers (1 min)
```bash
# Terminal 1: Start backend (port 3001)
npm run start:dev

# Terminal 2: Start frontend (port 3000)
cd frontend && npm run dev
```

### Step 5: Verify Everything Works
```bash
# Check backend health
curl http://localhost:3001/health

# Open frontend
open http://localhost:3000
```

## 🎯 What You Get

### Backend (http://localhost:3001)
- ✅ REST API with NestJS
- ✅ PostgreSQL database with Prisma ORM
- ✅ Redis for caching and queues
- ✅ MongoDB for analytics
- ✅ JWT authentication
- ✅ Health check endpoints
- ✅ Environment validation

### Frontend (http://localhost:3000)
- ✅ Next.js 14 with App Router
- ✅ TypeScript and Tailwind CSS
- ✅ Pre-built pages (Dashboard, Content, Analytics, etc.)
- ✅ Responsive design
- ✅ Dark mode support

## 📚 Key Commands

### Development
```bash
npm run start:dev              # Start backend in watch mode
cd frontend && npm run dev     # Start frontend dev server
```

### Database
```bash
npm run prisma:studio          # Open database GUI
npm run prisma:migrate         # Run migrations
npx prisma migrate reset       # Reset database (deletes data!)
```

### Code Quality
```bash
npm run lint                   # Lint backend code
npm run format                 # Format backend code
npm run build                  # Build backend
cd frontend && npm run lint    # Lint frontend code
```

### Docker
```bash
docker compose up -d           # Start all services
docker compose down            # Stop all services
docker compose logs -f         # View logs
docker compose ps              # List services
```

## 🔍 Health Check Endpoints

```bash
# Overall health
curl http://localhost:3001/health

# Readiness probe (for Kubernetes)
curl http://localhost:3001/health/ready

# Liveness probe
curl http://localhost:3001/health/live
```

## 📖 Documentation

- **SETUP.md** - Detailed setup instructions
- **PROJECT_STRUCTURE.md** - Project architecture
- **TASK_1_COMPLETION_SUMMARY.md** - What was implemented
- **.kiro/specs/** - Requirements, design, and tasks

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Restart PostgreSQL
docker compose restart postgres

# View logs
docker compose logs postgres
```

### Prisma Client Not Found
```bash
# Regenerate Prisma Client
npm run prisma:generate
```

## 🎓 Next Steps

1. ✅ **Task 1 Complete**: Project setup and infrastructure
2. **Task 2**: Database Schema Implementation
3. **Task 3**: Authentication System
4. **Task 4**: Authorization and RBAC

See `.kiro/specs/ai-social-media-platform/tasks.md` for the full task list.

## 💡 Tips

- Use `npm run prisma:studio` to visually explore your database
- Check `docker compose logs -f` if services aren't working
- Run `./scripts/verify-infrastructure.sh` to verify your setup
- Keep `.env` file secure and never commit it to Git

## 🆘 Need Help?

- Check the documentation in `.kiro/specs/`
- Review `SETUP.md` for detailed instructions
- Run verification script: `./scripts/verify-infrastructure.sh`

---

**Happy Coding! 🚀**
