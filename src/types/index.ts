// Global Types and Interfaces for Enterprise Backend

// JWT Payload
export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// User from request
export interface RequestUser {
  userId: string;
  email: string;
  roles?: string[];
  permissions?: string[];
}

// Email options
export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

// Query filters
export type QueryFilters = Record<string, unknown>;

// Prisma events
export interface PrismaQueryEvent {
  query: string;
  duration: number;
  params?: string;
  target?: string;
}

// Validation metadata
export interface ValidationMetadata {
  metatype?: new (...args: unknown[]) => unknown;
  type?: 'body' | 'query' | 'param' | 'custom';
  data?: string;
}

// Error response
export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  correlationId?: string;
}

// Pagination result
export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    perPage: number;
  };
}

// Sort order
export type SortOrder = 'asc' | 'desc';

// File upload result
export interface FileUploadResult {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

// Validation error
export interface ValidationError {
  property: string;
  constraints: Record<string, string>;
  children?: ValidationError[];
}

// User entity (simplified)
export interface User {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// OAuth profile (Google, etc.)
export interface OAuthProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  photo?: string;
  provider: string;
}

// Audit log entry
export interface AuditLogEntry {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
