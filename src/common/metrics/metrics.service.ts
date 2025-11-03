import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  public readonly register: Registry;

  // HTTP metrics
  private httpRequestsTotal: Counter;
  private httpRequestDuration: Histogram;

  // Database metrics
  private dbQueriesTotal: Counter;
  private dbQueryDuration: Histogram;

  // Authentication metrics
  private authAttemptsTotal: Counter;
  private authSuccessTotal: Counter;
  private authFailuresTotal: Counter;

  // Business metrics
  private notificationsSent: Counter;
  private filesUploaded: Counter;

  constructor() {
    this.register = new Registry();
    this.initializeMetrics();
  }

  onModuleInit() {
    collectDefaultMetrics({ register: this.register });
    console.log('✅ Prometheus metrics initialized');
  }

  private initializeMetrics() {
    // HTTP Metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    // Database Metrics
    this.dbQueriesTotal = new Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'model'],
      registers: [this.register],
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'model'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
      registers: [this.register],
    });

    // Auth Metrics
    this.authAttemptsTotal = new Counter({
      name: 'auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['method'],
      registers: [this.register],
    });

    this.authSuccessTotal = new Counter({
      name: 'auth_success_total',
      help: 'Total number of successful authentications',
      labelNames: ['method'],
      registers: [this.register],
    });

    this.authFailuresTotal = new Counter({
      name: 'auth_failures_total',
      help: 'Total number of failed authentications',
      labelNames: ['method', 'reason'],
      registers: [this.register],
    });

    // Business Metrics
    this.notificationsSent = new Counter({
      name: 'notifications_sent_total',
      help: 'Total number of notifications sent',
      labelNames: ['type', 'status'],
      registers: [this.register],
    });

    this.filesUploaded = new Counter({
      name: 'files_uploaded_total',
      help: 'Total number of files uploaded',
      labelNames: ['type'],
      registers: [this.register],
    });
  }

  // HTTP Metrics Methods
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  }

  // Database Metrics Methods
  recordDbQuery(operation: string, model: string, duration: number) {
    this.dbQueriesTotal.inc({ operation, model });
    this.dbQueryDuration.observe({ operation, model }, duration);
  }

  // Auth Metrics Methods
  recordAuthAttempt(method: string) {
    this.authAttemptsTotal.inc({ method });
  }

  recordAuthSuccess(method: string) {
    this.authSuccessTotal.inc({ method });
  }

  recordAuthFailure(method: string, reason: string) {
    this.authFailuresTotal.inc({ method, reason });
  }

  // Business Metrics Methods
  recordNotificationSent(type: string, status: string) {
    this.notificationsSent.inc({ type, status });
  }

  recordFileUpload(type: string) {
    this.filesUploaded.inc({ type });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
