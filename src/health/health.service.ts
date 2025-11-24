import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectConnection() private readonly mongoConnection: Connection,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async check() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMongoDB(),
      this.checkDiskSpace(),
      this.checkMemory(),
    ]);

    const [database, redis, mongodb, disk, memory] = checks;

    const allHealthy = checks.every((check) => check.status === 'fulfilled');

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV'),
      uptime: process.uptime(),
      checks: {
        database: {
          status: database.status === 'fulfilled' ? 'up' : 'down',
          message:
            database.status === 'fulfilled'
              ? 'Connected'
              : (database as PromiseRejectedResult).reason?.message,
          responseTime: database.status === 'fulfilled' 
            ? (database as PromiseFulfilledResult<any>).value 
            : null,
        },
        redis: {
          status: redis.status === 'fulfilled' ? 'up' : 'down',
          message:
            redis.status === 'fulfilled'
              ? 'Connected'
              : (redis as PromiseRejectedResult).reason?.message,
          responseTime: redis.status === 'fulfilled' 
            ? (redis as PromiseFulfilledResult<any>).value 
            : null,
        },
        mongodb: {
          status: mongodb.status === 'fulfilled' ? 'up' : 'down',
          message:
            mongodb.status === 'fulfilled'
              ? 'Connected'
              : (mongodb as PromiseRejectedResult).reason?.message,
          responseTime: mongodb.status === 'fulfilled' 
            ? (mongodb as PromiseFulfilledResult<any>).value 
            : null,
        },
        disk: {
          status: disk.status === 'fulfilled' ? 'ok' : 'warning',
          message:
            disk.status === 'fulfilled'
              ? 'Sufficient space'
              : (disk as PromiseRejectedResult).reason?.message,
          details: disk.status === 'fulfilled' 
            ? (disk as PromiseFulfilledResult<any>).value 
            : null,
        },
        memory: {
          status: memory.status === 'fulfilled' ? 'ok' : 'warning',
          message:
            memory.status === 'fulfilled'
              ? 'Sufficient memory'
              : (memory as PromiseRejectedResult).reason?.message,
          details: memory.status === 'fulfilled' 
            ? (memory as PromiseFulfilledResult<any>).value 
            : null,
        },
      },
    };
  }

  async readiness() {
    try {
      const startTime = Date.now();
      await Promise.all([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkMongoDB(),
      ]);
      const responseTime = Date.now() - startTime;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
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
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      },
      cpu: {
        user: `${Math.round(cpuUsage.user / 1000)}ms`,
        system: `${Math.round(cpuUsage.system / 1000)}ms`,
      },
      pid: process.pid,
      nodeVersion: process.version,
    };
  }

  private async checkDatabase(): Promise<number> {
    const startTime = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    return Date.now() - startTime;
  }

  private async checkRedis(): Promise<number> {
    const startTime = Date.now();
    await this.redis.ping();
    return Date.now() - startTime;
  }

  private async checkMongoDB(): Promise<number> {
    const startTime = Date.now();
    
    if (this.mongoConnection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }
    
    await this.mongoConnection.db.admin().ping();
    return Date.now() - startTime;
  }

  private async checkDiskSpace(): Promise<any> {
    // This is a simplified check - in production, you'd use a library like 'check-disk-space'
    // For now, we'll just return a placeholder
    return {
      available: 'N/A',
      total: 'N/A',
      usage: 'N/A',
    };
  }

  private async checkMemory(): Promise<any> {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const usagePercent = (usedMemory / totalMemory) * 100;

    if (usagePercent > 90) {
      throw new Error(`High memory usage: ${usagePercent.toFixed(2)}%`);
    }

    return {
      total: `${Math.round(totalMemory / 1024 / 1024)}MB`,
      used: `${Math.round(usedMemory / 1024 / 1024)}MB`,
      usage: `${usagePercent.toFixed(2)}%`,
    };
  }
}
