import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    // Get real IP behind proxy/load balancer
    const ips = req.ips as string[] | undefined;
    const ip = req.ip as string | undefined;
    const headers = req.headers as Record<string, string> | undefined;
    const connection = req.connection as { remoteAddress?: string } | undefined;

    return ips && ips.length > 0
      ? ips[0]
      : ip ||
          headers?.['x-forwarded-for'] ||
          headers?.['x-real-ip'] ||
          connection?.remoteAddress ||
          'unknown';
  }
}
