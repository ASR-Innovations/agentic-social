# AI-Powered Social Media Management Platform

A comprehensive social media management platform with multi-agent AI architecture, supporting 9+ platforms with enterprise-grade security and multi-tenant architecture.

## 🚀 Features

- **Multi-Tenant Architecture**: Complete tenant isolation with PostgreSQL Row-Level Security (RLS)
- **JWT Authentication**: Secure authentication with tenant_id claims
- **AWS S3 Integration**: Media storage with CloudFront CDN support
- **Redis Caching**: High-performance caching and job queuing with BullMQ
- **Multi-Platform Support**: Ready for Instagram, Twitter, LinkedIn, Facebook, TikTok, YouTube, Pinterest, Threads, and Reddit
- **Enterprise Security**: Encrypted OAuth tokens, RBAC, and audit trails

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js with NestJS framework
- **Database**: PostgreSQL 15+ with Row-Level Security
- **Cache/Queue**: Redis 7+ with Bull queues
- **Storage**: AWS S3 + CloudFront CDN
- **Authentication**: JWT with Passport.js

### Multi-Tenant Design
- Row-Level Security (RLS) for complete data isolation
- Tenant-scoped JWT tokens
- Per-tenant AI budget tracking
- Scalable from single to enterprise deployments

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- AWS Account (for S3 storage)
- Docker & Docker Compose (optional)

## 🛠️ Installation

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-social-media-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL and Redis**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up postgres redis -d
   
   # Or install locally and start services
   ```

5. **Run database migrations**
   ```bash
   npm run migration:run
   ```

6. **Start the development server**
   ```bash
   npm run start:dev
   ```

### Option 2: Docker Development

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Run migrations**
   ```bash
   docker-compose exec app npm run migration:run
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3001` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_NAME` | Database name | `ai_social_platform` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `AWS_ACCESS_KEY_ID` | AWS access key | Required |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Required |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | Required |
| `AWS_CLOUDFRONT_DOMAIN` | CloudFront domain | Optional |

### Database Setup

The application uses PostgreSQL with Row-Level Security for multi-tenant isolation:

```sql
-- Enable RLS on tenant-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_users ON users
USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new tenant and admin user
- `POST /api/v1/auth/login` - Login with email/password
- `GET /api/v1/auth/profile` - Get current user profile
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Tenant Management

- `GET /api/v1/tenants` - List tenants (admin only)
- `GET /api/v1/tenants/:id` - Get tenant details
- `PATCH /api/v1/tenants/:id` - Update tenant settings

### User Management

- `GET /api/v1/users` - List tenant users
- `POST /api/v1/users` - Create new user
- `GET /api/v1/users/:id` - Get user details
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Media Management

- `POST /api/v1/media/upload` - Upload media file
- `POST /api/v1/media/upload/:folder` - Upload to specific folder
- `DELETE /api/v1/media/:key` - Delete media file

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Docker Production

```bash
docker-compose --profile production up -d
```

### AWS Deployment

The application is designed for AWS deployment:

- **Compute**: ECS with Fargate or EC2
- **Database**: RDS PostgreSQL with Multi-AZ
- **Cache**: ElastiCache Redis
- **Storage**: S3 with CloudFront
- **Load Balancer**: Application Load Balancer

## 🔒 Security Features

- **Multi-Tenant Isolation**: PostgreSQL RLS ensures complete data separation
- **Encrypted Storage**: OAuth tokens encrypted at rest with AES-256
- **JWT Security**: Tokens include tenant_id claims for authorization
- **Input Validation**: Comprehensive validation with class-validator
- **Rate Limiting**: Built-in rate limiting per tenant/endpoint
- **CORS Protection**: Configurable CORS policies

## 📊 Monitoring

### Health Checks

- `GET /api/v1/health` - Application health status
- Docker health checks included
- Database connection monitoring

### Logging

- Structured JSON logging
- Request/response logging
- Error tracking with stack traces
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Next Steps**: This foundation supports the implementation of AI agents, social media integrations, and advanced features as defined in the project specifications.