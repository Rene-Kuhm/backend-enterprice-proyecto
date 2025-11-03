import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.create({ data });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params || {};
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    }) as unknown as User[];
  }

  async findOne(where: Prisma.UserWhereUniqueInput, includePassword = false): Promise<User | null> {
    const select = includePassword
      ? undefined
      : {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          phone: true,
          isActive: true,
          isEmailVerified: true,
          twoFactorEnabled: true,
          createdAt: true,
          updatedAt: true,
          password: false,
        };

    return this.prisma.user.findUnique({
      where,
      select,
    }) as unknown as User;
  }

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    return this.findOne({ email }, includePassword);
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ id });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    }) as unknown as User;
  }

  async remove(id: string): Promise<User> {
    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }
}
