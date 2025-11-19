import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async check() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMongoDB(),
    ]);

    const [database, redis, mongodb] = checks;

    return {
      status: checks.every((check) => check.status === 'fulfilled')
        ? 'healthy'
        : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV'),
      checks: {
        database: {
          status: database.status === 'fulfilled' ? 'up' : 'down',
          message:
            database.status === 'fulfilled'
              ? 'Connected'
              : (database as PromiseRejectedResult).reason?.message,
        },
        redis: {
          status: redis.status === 'fulfilled' ? 'up' : 'down',
          message:
            redis.status === 'fulfilled'
              ? 'Connected'
              : (redis as PromiseRejectedResult).reason?.message,
        },
        mongodb: {
          status: mongodb.status === 'fulfilled' ? 'up' : 'down',
          message:
            mongodb.status === 'fulfilled'
              ? 'Connected'
              : (mongodb as PromiseRejectedResult).reason?.message,
        },
      },
    };
  }

  async readiness() {
    try {
      await this.checkDatabase();
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  private async checkDatabase(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    // Redis check will be implemented when Redis client is set up
    // For now, just return success
    return Promise.resolve();
  }

  private async checkMongoDB(): Promise<void> {
    // MongoDB check will be implemented when MongoDB client is set up
    // For now, just return success
    return Promise.resolve();
  }
}
