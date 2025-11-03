import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Get real IP behind proxy/load balancer
    return (
      req.ips?.length > 0
        ? req.ips[0]
        : req.ip ||
          req.headers['x-forwarded-for'] ||
          req.headers['x-real-ip'] ||
          req.connection?.remoteAddress ||
          'unknown'
    );
  }
}
