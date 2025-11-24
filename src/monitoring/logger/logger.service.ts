import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(private readonly configService: ConfigService) {
    this.initializeLogger();
  }

  private initializeLogger() {
    const logLevel = this.configService.get('LOG_LEVEL', 'info');
    const nodeEnv = this.configService.get('NODE_ENV', 'development');

    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, context, trace, ...metadata }) => {
        let msg = `${timestamp} [${level.toUpperCase()}]`;
        
        if (context) {
          msg += ` [${context}]`;
        }
        
        msg += `: ${message}`;
        
        if (Object.keys(metadata).length > 0) {
          msg += ` ${JSON.stringify(metadata)}`;
        }
        
        if (trace) {
          msg += `\n${trace}`;
        }
        
        return msg;
      }),
    );

    // Console transport for development
    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    });

    // File transports for production
    const fileTransports = [
      // Error logs
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
        format: logFormat,
      }),
      // Combined logs
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: logFormat,
      }),
      // Application logs
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        maxSize: '20m',
        maxFiles: '30d',
        format: logFormat,
      }),
    ];

    // Create logger instance
    this.logger = winston.createLogger({
      level: logLevel,
      format: logFormat,
      defaultMeta: {
        service: 'ai-social-media-platform',
        environment: nodeEnv,
      },
      transports:
        nodeEnv === 'production'
          ? [...fileTransports, consoleTransport]
          : [consoleTransport],
      exitOnError: false,
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, {
      context: context || this.context,
      trace,
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Additional structured logging methods
  logWithMetadata(level: string, message: string, metadata: Record<string, any>) {
    this.logger.log(level, message, {
      ...metadata,
      context: this.context,
    });
  }

  logRequest(req: any) {
    this.logger.info('HTTP Request', {
      context: this.context,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      workspaceId: req.user?.workspaceId,
    });
  }

  logResponse(req: any, res: any, responseTime: number) {
    this.logger.info('HTTP Response', {
      context: this.context,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id,
      workspaceId: req.user?.workspaceId,
    });
  }

  logError(error: Error, context?: string) {
    this.logger.error(error.message, {
      context: context || this.context,
      stack: error.stack,
      name: error.name,
    });
  }

  logBusinessEvent(event: string, data: Record<string, any>) {
    this.logger.info(`Business Event: ${event}`, {
      context: this.context,
      event,
      ...data,
    });
  }

  logPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    this.logger.info(`Performance: ${operation}`, {
      context: this.context,
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  }

  logSecurityEvent(event: string, data: Record<string, any>) {
    this.logger.warn(`Security Event: ${event}`, {
      context: this.context,
      event,
      ...data,
    });
  }
}
