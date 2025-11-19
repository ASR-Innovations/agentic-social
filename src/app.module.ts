import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { MediaModule } from './media/media.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { DatabaseConfig } from './config/database.config';
import { RedisConfig } from './config/redis.config';
import { validate } from './config/env.validation';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate,
    }),
    
    // Prisma ORM (Primary database client)
    PrismaModule,
    
    // TypeORM (Legacy support - can be removed later)
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    
    // MongoDB for analytics and logs
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/ai_social_analytics?authSource=admin'),
    
    // Redis configuration for caching and job queues
    BullModule.forRootAsync({
      useClass: RedisConfig,
    }),
    
    // Core modules
    HealthModule,
    
    // Feature modules
    AuthModule,
    TenantModule,
    UserModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}