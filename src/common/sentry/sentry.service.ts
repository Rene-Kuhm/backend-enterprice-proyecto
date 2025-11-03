import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { INestApplication } from '@nestjs/common';

@Injectable()
export class SentryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const dsn = this.configService.get<string>('sentry.dsn');
    const environment = this.configService.get<string>('sentry.environment');

    if (dsn) {
      Sentry.init({
        dsn,
        environment,
        integrations: [
          new ProfilingIntegration(),
          new Sentry.Integrations.Http({ tracing: true }),
        ],
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
      });

      console.log('✅ Sentry initialized successfully');
    } else {
      console.log('⚠️  Sentry DSN not configured, error tracking disabled');
    }
  }

  captureException(exception: any, context?: Record<string, any>) {
    Sentry.captureException(exception, {
      extra: context,
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  clearUser() {
    Sentry.setUser(null);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  setupGlobalFilter(app: INestApplication) {
    // This will be implemented with a global exception filter
    // For now, we'll skip it as it requires additional setup
  }
}
