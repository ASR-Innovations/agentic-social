import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable response compression (gzip/deflate)
  app.use(compression({
    threshold: 1024, // Only compress responses larger than 1KB
    level: 6, // Compression level (0-9)
    filter: (req: any, res: any) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression's default filter
      return compression.filter(req, res);
    },
  }));
  
  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  // Global prefix for API routes
  app.setGlobalPrefix('api');
  
  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('AI Social Media Management Platform API')
    .setDescription(
      'Enterprise-grade REST API for AI-native social media management. ' +
      'This API provides comprehensive endpoints for content publishing, analytics, ' +
      'social listening, community management, AI-powered content generation, and more. ' +
      '\n\n## Features\n' +
      '- Multi-platform content publishing (Instagram, Facebook, Twitter, LinkedIn, TikTok, etc.)\n' +
      '- AI multi-agent content generation and optimization\n' +
      '- Real-time analytics and reporting\n' +
      '- Social listening and brand monitoring\n' +
      '- Unified inbox for community management\n' +
      '- Influencer discovery and campaign management\n' +
      '- Social commerce integration\n' +
      '- Approval workflows and automation\n' +
      '\n## Authentication\n' +
      'All API endpoints require authentication using JWT Bearer tokens. ' +
      'Include the token in the Authorization header: `Authorization: Bearer <token>`\n' +
      '\n## Rate Limiting\n' +
      'API requests are rate-limited based on your subscription plan:\n' +
      '- Free: 100 requests/hour\n' +
      '- Starter: 1,000 requests/hour\n' +
      '- Professional: 10,000 requests/hour\n' +
      '- Enterprise: Unlimited\n' +
      '\n## Webhooks\n' +
      'Configure webhooks to receive real-time notifications for events like post publishing, ' +
      'new mentions, messages, and more.\n' +
      '\n## SDKs\n' +
      'Official SDKs available for JavaScript/TypeScript and Python. See documentation for details.'
    )
    .setVersion('1.0.0')
    .setContact(
      'API Support',
      'https://docs.example.com',
      'api-support@example.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for server-to-server authentication',
      },
      'API-Key',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Posts', 'Content creation, scheduling, and publishing')
    .addTag('Analytics', 'Performance metrics and reporting')
    .addTag('Social Accounts', 'Social media account management')
    .addTag('AI', 'AI-powered content generation and optimization')
    .addTag('Listening', 'Social listening and brand monitoring')
    .addTag('Inbox', 'Unified inbox and community management')
    .addTag('Media', 'Media library and asset management')
    .addTag('Campaigns', 'Campaign management and tracking')
    .addTag('Influencers', 'Influencer discovery and management')
    .addTag('Commerce', 'Social commerce integration')
    .addTag('Workflows', 'Approval workflows and automation')
    .addTag('Team', 'Team and workspace management')
    .addTag('Integrations', 'Third-party integrations')
    .addTag('Webhooks', 'Webhook configuration and management')
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://api-staging.example.com', 'Staging Environment')
    .addServer('https://api.example.com', 'Production Environment')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  // Serve Swagger UI at /api/docs
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'AI Social Media Platform API Documentation',
    customfavIcon: 'https://example.com/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .info .title { font-size: 36px }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
    },
  });

  // Export OpenAPI JSON specification
  const fs = require('fs');
  const path = require('path');
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(docsDir, 'openapi.json'),
    JSON.stringify(document, null, 2)
  );
  fs.writeFileSync(
    path.join(docsDir, 'openapi.yaml'),
    require('js-yaml').dump(document)
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 AI Social Media Platform API running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  console.log(`📄 OpenAPI Spec: http://localhost:${port}/api/docs-json`);
}

bootstrap();