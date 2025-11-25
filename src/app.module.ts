import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { MediaModule } from './media/media.module';
import { SocialAccountModule } from './social-account/social-account.module';
import { PostModule } from './post/post.module';
import { AIModule } from './ai/ai.module';
import { AgentFlowModule } from './agentflow/agentflow.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/throttle.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Database configuration with multi-tenant support
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    
    // Redis configuration for caching and job queues
    BullModule.forRootAsync({
      useClass: RedisConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),

    // Feature modules
    AuthModule,
    TenantModule,
    UserModule,
    MediaModule,
    SocialAccountModule,
    PostModule,
    AIModule,
    AgentFlowModule, // NEW: Multi-agent AI system
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}