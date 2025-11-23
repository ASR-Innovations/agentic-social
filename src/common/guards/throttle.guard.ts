import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use tenant ID + IP for rate limiting
    const tenantId = req.user?.tenantId || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress;
    return `${tenantId}-${ip}`;
  }
}
