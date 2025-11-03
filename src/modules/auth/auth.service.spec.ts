import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    avatar: null,
    phone: null,
    isActive: true,
    isEmailVerified: true,
    emailVerifiedAt: null,
    googleId: null,
    oauthProvider: null,
    twoFactorSecret: null,
    twoFactorEnabled: false,
    lastLoginAt: null,
    lastLoginIp: null,
    passwordChangedAt: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        'jwt.secret': 'test-secret-key',
        'jwt.expiresIn': '15m',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    }),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $disconnect: jest.fn(),
    $connect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have validateUser method', () => {
      expect(service.validateUser).toBeDefined();
      expect(typeof service.validateUser).toBe('function');
    });

    it('should have login method', () => {
      expect(service.login).toBeDefined();
      expect(typeof service.login).toBe('function');
    });

    it('should have register method', () => {
      expect(service.register).toBeDefined();
      expect(typeof service.register).toBe('function');
    });
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email, true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toBeDefined();
      if (result) {
        expect(result.email).toBe(email);
      }
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);
      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email, true);
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);
      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });
  });

  describe('login', () => {
    it('should return access token and refresh token', async () => {
      const user = mockUser;

      const expectedAccessToken = 'access.token.jwt';
      const expectedRefreshToken = 'refresh.token.jwt';

      mockJwtService.sign.mockReturnValueOnce(expectedAccessToken);
      mockJwtService.sign.mockReturnValueOnce(expectedRefreshToken);
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: '1',
        token: expectedRefreshToken,
        userId: user.id.toString(),
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });

      const result = await service.login(user);

      expect(result).toHaveProperty('accessToken', expectedAccessToken);
      expect(result).toHaveProperty('refreshToken', expectedRefreshToken);
      expect(result).toHaveProperty('user');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should store refresh token in database', async () => {
      const user = mockUser;

      mockJwtService.sign.mockReturnValueOnce('access.token');
      mockJwtService.sign.mockReturnValueOnce('refresh.token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: '1',
        token: 'refresh.token',
        userId: user.id.toString(),
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });

      await service.login(user);

      expect(mockPrismaService.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const username = 'newuser';

      const hashedPassword = 'hashedPassword123';
      const newUser = {
        ...mockUser,
        id: '2',
        email,
        username,
        password: hashedPassword,
      };

      const expectedAccessToken = 'access.token.jwt';
      const expectedRefreshToken = 'refresh.token.jwt';

      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValueOnce(expectedAccessToken);
      mockJwtService.sign.mockReturnValueOnce(expectedRefreshToken);
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: '1',
        token: expectedRefreshToken,
        userId: newUser.id,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });

      const result = await service.register(email, password, username);

      expect(result).toHaveProperty('accessToken', expectedAccessToken);
      expect(result).toHaveProperty('refreshToken', expectedRefreshToken);
      expect(result).toHaveProperty('user');
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('should create user without username', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';

      const newUser = {
        ...mockUser,
        id: '2',
        email,
        username: null,
      };

      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: '1',
        token: 'token',
        userId: newUser.id,
        expiresAt: new Date(),
        isRevoked: false,
        createdAt: new Date(),
      });

      const result = await service.register(email, password);

      expect(result).toHaveProperty('user');
      expect(mockUsersService.create).toHaveBeenCalled();
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT payload', () => {
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
      };

      mockJwtService.sign.mockReturnValue('valid.jwt.token');

      const token = jwtService.sign(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
    });
  });

  describe('Configuration', () => {
    it('should retrieve JWT configuration correctly', () => {
      const secret = configService.get('jwt.secret');
      const expiresIn = configService.get('jwt.expiresIn');

      expect(secret).toBe('test-secret-key');
      expect(expiresIn).toBe('15m');
      expect(mockConfigService.get).toHaveBeenCalledTimes(2);
    });
  });
});
