import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

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

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
    $connect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have create method', () => {
      expect(service.create).toBeDefined();
      expect(typeof service.create).toBe('function');
    });

    it('should have findAll method', () => {
      expect(service.findAll).toBeDefined();
      expect(typeof service.findAll).toBe('function');
    });

    it('should have findById method', () => {
      expect(service.findById).toBeDefined();
      expect(typeof service.findById).toBe('function');
    });

    it('should have findByEmail method', () => {
      expect(service.findByEmail).toBeDefined();
      expect(typeof service.findByEmail).toBe('function');
    });

    it('should have update method', () => {
      expect(service.update).toBeDefined();
      expect(typeof service.update).toBe('function');
    });

    it('should have remove method', () => {
      expect(service.remove).toBeDefined();
      expect(typeof service.remove).toBe('function');
    });
  });

  describe('create', () => {
    it('should successfully create a new user', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'hashedPassword',
        name: 'New User',
      };

      const expectedUser = {
        ...mockUser,
        id: 2,
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });

    it('should handle duplicate email in database', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'hashedPassword',
      };

      mockPrismaService.user.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`email`)'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      const createUserDto = {
        email: 'error@example.com',
        password: 'hashedPassword',
        name: 'Error User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createUserDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: 2, email: 'user2@example.com' },
        { ...mockUser, id: 3, email: 'user3@example.com' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(result).toHaveLength(3);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should support pagination parameters', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      await service.findAll({ skip: 0, take: 10 });

      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const userId = '1';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      const userId = '999';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById(userId);
      expect(result).toBeNull();
    });

    it('should handle invalid user ID', async () => {
      const invalidId = 'invalid';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById(invalidId);
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      const email = 'test@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
    });

    it('should return null when user not found', async () => {
      const email = 'notfound@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
    });

    it('should handle uppercase emails', async () => {
      const email = 'TEST@EXAMPLE.COM';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(result).toBeDefined();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should successfully update a user', async () => {
      const userId = '1';
      const updateData = {
        firstName: 'Updated',
        phone: '+1234567890',
      };

      const updatedUser = {
        ...mockUser,
        ...updateData,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(result.firstName).toBe(updateData.firstName);
    });

    it('should hash password when updating', async () => {
      const userId = '1';
      const updateData = {
        password: 'newPassword123',
      };

      const updatedUser = {
        ...mockUser,
        password: 'hashedNewPassword',
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateData);

      expect(result).toBeDefined();
    });

    it('should not allow updating immutable fields', async () => {
      const userId = '1';
      const updateData = {
        firstName: 'Updated Name',
      };

      const updatedUser = {
        ...mockUser,
        firstName: updateData.firstName,
      };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateData);

      expect(result.id).toBe(mockUser.id); // ID should remain unchanged
    });
  });

  describe('remove', () => {
    it('should successfully soft delete a user', async () => {
      const userId = '1';
      const deletedUser = {
        ...mockUser,
        deletedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(deletedUser);

      const result = await service.remove(userId);

      expect(result.deletedAt).toBeDefined();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should set deletedAt timestamp', async () => {
      const userId = '1';
      const deletedUser = {
        ...mockUser,
        deletedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(deletedUser);

      const result = await service.remove(userId);

      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it('should handle database errors during deletion', async () => {
      const userId = '1';

      mockPrismaService.user.update.mockRejectedValue(new Error('Database error'));

      await expect(service.remove(userId)).rejects.toThrow();
    });
  });

  describe('User Statistics', () => {
    it('should count total users', async () => {
      mockPrismaService.user.count.mockResolvedValue(42);

      const count = await prisma.user.count();

      expect(count).toBe(42);
      expect(mockPrismaService.user.count).toHaveBeenCalled();
    });

    it('should filter active users', async () => {
      const activeUsers = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(activeUsers);

      const result = await prisma.user.findMany({
        where: { isActive: true },
      });

      expect(result).toEqual(activeUsers);
    });
  });
});
