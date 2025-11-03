import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, ip } = request;
    const userAgent = request.get('user-agent') || '';

    return next.handle().pipe(
      tap({
        next: async (data) => {
          // Only audit mutations (POST, PUT, PATCH, DELETE)
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            await this.createAuditLog({
              userId: user?.id,
              action: this.getActionFromMethod(method, url),
              resource: this.getResourceFromUrl(url),
              resourceId: data?.id || body?.id,
              oldValue: method === 'PUT' || method === 'PATCH' ? body : null,
              newValue: data,
              ipAddress: ip,
              userAgent,
            });
          }
        },
      }),
    );
  }

  private async createAuditLog(data: Record<string, unknown>) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId as string,
          action: data.action as string,
          resource: data.resource as string,
          resourceId: data.resourceId as string,
          oldValue: data.oldValue ? JSON.parse(JSON.stringify(data.oldValue)) : null,
          newValue: data.newValue ? JSON.parse(JSON.stringify(data.newValue)) : null,
          ipAddress: data.ipAddress as string,
          userAgent: data.userAgent as string,
        },
      });
    } catch (error) {
      // Silently fail to not disrupt the request
      console.error('Failed to create audit log:', error);
    }
  }

  private getActionFromMethod(method: string, url: string): string {
    const resource = this.getResourceFromUrl(url);
    const actionMap: Record<string, string> = {
      POST: 'created',
      PUT: 'updated',
      PATCH: 'updated',
      DELETE: 'deleted',
    };
    return `${resource}.${actionMap[method] || 'unknown'}`;
  }

  private getResourceFromUrl(url: string): string {
    // Extract resource from URL (e.g., /api/v1/users/123 -> User)
    const parts = url.split('/').filter((p) => p && p !== 'api' && !p.startsWith('v'));
    if (parts.length > 0) {
      const resource = parts[0];
      return resource.charAt(0).toUpperCase() + resource.slice(1, -1); // Remove trailing 's'
    }
    return 'Unknown';
  }
}
