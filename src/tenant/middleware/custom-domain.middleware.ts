import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WhiteLabelService } from '../services/white-label.service';

@Injectable()
export class CustomDomainMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CustomDomainMiddleware.name);

  constructor(private whiteLabelService: WhiteLabelService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.get('host');

    if (!host) {
      return next();
    }

    // Extract domain without port
    const domain = host.split(':')[0];

    // Skip if it's the main platform domain
    const platformDomains = [
      'localhost',
      '127.0.0.1',
      'platform.com',
      'app.platform.com',
      // Add your platform domains here
    ];

    if (platformDomains.some(pd => domain.includes(pd))) {
      return next();
    }

    try {
      // Look up workspace by custom domain
      const workspaceId = await this.whiteLabelService.getWorkspaceByDomain(domain);

      if (workspaceId) {
        // Attach workspace ID to request for downstream use
        (req as any).customDomainWorkspaceId = workspaceId;
        this.logger.log(`Custom domain ${domain} mapped to workspace ${workspaceId}`);
      }
    } catch (error) {
      this.logger.error(`Error processing custom domain ${domain}:`, error);
    }

    next();
  }
}
