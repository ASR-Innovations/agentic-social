import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import compression = require('compression');

/**
 * Middleware for compressing HTTP responses
 * Uses gzip/deflate compression to reduce response size
 */
@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private compressionMiddleware: any;

  constructor() {
    this.compressionMiddleware = compression({
      // Only compress responses larger than 1KB
      threshold: 1024,
      
      // Compression level (0-9, where 9 is maximum compression)
      level: 6,
      
      // Filter function to determine which responses to compress
      filter: (req: Request, res: Response) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
          return false;
        }

        // Don't compress images, videos, or already compressed content
        const contentType = res.getHeader('Content-Type') as string;
        if (contentType) {
          const skipTypes = [
            'image/',
            'video/',
            'audio/',
            'application/zip',
            'application/gzip',
            'application/x-gzip',
          ];
          
          if (skipTypes.some((type) => contentType.includes(type))) {
            return false;
          }
        }

        // Use compression's default filter for other cases
        return compression.filter(req, res);
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.compressionMiddleware(req, res, next);
  }
}
