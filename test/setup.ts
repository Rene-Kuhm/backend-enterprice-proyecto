// Test setup file
import { Test } from '@nestjs/testing';

// Global test configuration
jest.setTimeout(30000);

/**
 * Helper function to create testing modules
 */
export const createTestingModule = async (providers: any[]) => {
  return await Test.createTestingModule({
    providers,
  }).compile();
};

/**
 * Mock Prisma Service for tests
 */
export const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
};

/**
 * Mock JWT Service for tests
 */
export const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

/**
 * Mock Config Service for tests
 */
export const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, any> = {
      'jwt.secret': 'test-secret',
      'jwt.expiresIn': '15m',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.refreshExpiresIn': '7d',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      NODE_ENV: 'test',
    };
    return config[key];
  }),
};
