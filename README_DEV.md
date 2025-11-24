# Agentic Social - AI-Powered Social Media Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Enterprise-grade social media management platform with AI-powered content generation, multi-workspace support, and comprehensive analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Cloud database accounts (free tiers available)

### 1. Clone the Repository
```bash
git clone https://github.com/ASR-Innovations/agentic-social.git
cd agentic-social
git checkout dev
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Cloud Databases (2 minutes)
Follow the [Cloud Database Setup Guide](CLOUD_DATABASE_SETUP.md) to get your free database URLs.

### 4. Configure Environment
Copy `.env.example` to `.env` and update with your database URLs:
```bash
cp .env.example .env
```

### 5. Run Database Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### 6. Start the Backend
```bash
npm run start:dev
```

Backend will be available at http://localhost:3001

### 7. Start the Frontend (Optional)
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

## 📚 Documentation

- [Cloud Database Setup](CLOUD_DATABASE_SETUP.md) - Quick setup guide for cloud databases
- [Deployment Status](DEPLOYMENT_STATUS.md) - Current deployment status and next steps
- [API Documentation](http://localhost:3001/api) - Swagger API docs (when server is running)

## 🎯 Features

### Core Features
- 🤖 **AI-Powered Content Generation** - Generate engaging social media content with AI
- 📅 **Content Scheduling** - Schedule posts across multiple platforms
- 📊 **Analytics Dashboard** - Comprehensive analytics and insights
- 💬 **Unified Inbox** - Manage all social conversations in one place
- ⭐ **Review Management** - Monitor and respond to reviews
- 🎯 **Influencer Discovery** - Find and collaborate with influencers
- 🚀 **Campaign Management** - Create and track marketing campaigns

### Enterprise Features
- 🏢 **Multi-Workspace Management** - Manage multiple brands/clients
- 🔐 **SSO Integration** - SAML, Google, Azure AD, Okta support
- 👥 **Role-Based Access Control** - Granular permission management
- 🔒 **Two-Factor Authentication** - Enhanced security
- 📝 **Audit Trail** - Complete activity logging
- 🌐 **White-Label Support** - Custom branding for agencies

### Technical Features
- ⚡ **Real-time Updates** - WebSocket-based notifications
- 🔄 **Background Jobs** - Efficient task processing with Bull Queue
- 💾 **Multi-Layer Caching** - L1, L2, L3 caching for optimal performance
- 📈 **Monitoring** - Prometheus metrics and Jaeger tracing
- 🎨 **API Optimization** - DataLoader, cursor pagination, response compression

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS 10.x
- **Language:** TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **Cache:** Redis
- **Analytics:** MongoDB
- **Queue:** Bull (Redis-based)
- **Real-time:** Socket.io
- **API Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui
- **State Management:** React Context + Hooks
- **API Client:** Axios

## 📦 Project Structure

```
agentic-social/
├── src/                    # Backend source code
│   ├── auth/              # Authentication & authorization
│   ├── user/              # User management
│   ├── tenant/            # Multi-workspace management
│   ├── social-account/    # Social media connections
│   ├── post/              # Content management
│   ├── analytics/         # Analytics & reporting
│   ├── community/         # Inbox & review management
│   ├── influencer/        # Influencer discovery
│   ├── campaign/          # Campaign management
│   └── ...
├── frontend/              # Frontend Next.js application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities and API client
│   └── ...
├── prisma/               # Database schema and migrations
├── docs/                 # Additional documentation
└── scripts/              # Utility scripts
```

## 🔧 Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality
```bash
# Linting
npm run lint

# Format code
npm run format
```

### Database Management
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## 🌐 Supported Platforms

- ✅ Instagram
- ✅ Facebook
- ✅ Twitter/X
- ✅ LinkedIn
- ✅ TikTok
- ✅ YouTube (coming soon)
- ✅ Pinterest (coming soon)

## 🔐 Security

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection

## 📊 Performance

- Multi-layer caching (L1: Memory, L2/L3: Redis)
- Database query optimization
- Connection pooling
- Response compression
- DataLoader for N+1 query prevention
- Cursor-based pagination
- Background job processing

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- shadcn for the beautiful UI components
- All open-source contributors

## 📞 Support

- 📧 Email: support@asr-innovations.com
- 🐛 Issues: [GitHub Issues](https://github.com/ASR-Innovations/agentic-social/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ASR-Innovations/agentic-social/discussions)

---

**Built with ❤️ by ASR Innovations**
