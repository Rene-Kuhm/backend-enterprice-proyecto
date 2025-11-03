import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { StringHelper, DateHelper } from '@/common/helpers';
import { EmailService } from '@/common/email/email.service';
import { SmsService } from '@/common/sms/sms.service';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME_MINUTES = 30;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account is locked. Try again after ${user.lockedUntil.toLocaleString()}`,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts on successful login
    await this.resetFailedLoginAttempts(user.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async register(data: {
    email: string;
    password: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (data.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Assign default user role
    const userRole = await this.prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (userRole) {
      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id,
        },
      });
    }

    // Generate and send email verification token
    await this.sendEmailVerification(user.email, user.firstName || 'User');

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.firstName || 'User');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async login(user: User, req: { ip?: string; headers?: Record<string, string> }) {
    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.ip,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await this.createSession(user.id, tokens.refreshToken, req);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });

      // Generate new tokens
      const newTokens = await this.generateTokens(user);

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });

    await this.prisma.session.updateMany({
      where: { refreshToken },
      data: { isActive: false },
    });
  }

  // Email Verification
  async sendEmailVerification(email: string, name: string) {
    const token = StringHelper.generateRandomToken(32);
    const expiresAt = DateHelper.getExpiryDateFromHours(24);

    await this.prisma.emailVerificationToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    await this.emailService.sendVerificationEmail(email, name, token);
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.prisma.user.update({
      where: { email: verificationToken.email },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    await this.prisma.emailVerificationToken.delete({
      where: { token },
    });

    return { message: 'Email verified successfully' };
  }

  // Password Reset
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If email exists, reset link has been sent' };
    }

    const token = StringHelper.generateRandomToken(32);
    const expiresAt = DateHelper.getExpiryDateFromHours(1);

    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    await this.emailService.sendPasswordResetEmail(email, user.firstName || 'User', token);

    return { message: 'If email exists, reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used) {
      throw new BadRequestException('Invalid or used reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email: resetToken.email },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    await this.prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: {
        user: { email: resetToken.email },
      },
      data: { isRevoked: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    await this.emailService.sendPasswordChangedEmail(resetToken.email, user.firstName || 'User');

    return { message: 'Password reset successfully' };
  }

  // Two-Factor Authentication (2FA)
  async enable2FA(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `${this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME')} (${user.email})`,
      length: 32,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
      },
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async verify2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not set up');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    // Enable 2FA after successful verification
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
    });

    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA not enabled');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { message: '2FA disabled successfully' };
  }

  async validate2FAToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  // Helper methods
  private async generateTokens(user: User) {
    const userWithRoles = user as User & { roles?: Array<{ role: { name: string } }> };
    const payload = {
      sub: user.id,
      email: user.email,
      roles: userWithRoles.roles ? userWithRoles.roles.map((ur) => ur.role.name) : [],
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      },
    );

    const refreshTokenExpiry = DateHelper.parseJwtExpiration(
      this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    );

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    req: { ip?: string; headers?: Record<string, string> },
  ) {
    const expiresAt = DateHelper.getExpiryDateFromDays(7);

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers?.['user-agent'] || 'unknown',
        expiresAt,
      },
    });
  }

  private async handleFailedLogin(user: User) {
    const failedAttempts = user.failedLoginAttempts + 1;

    if (failedAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = DateHelper.addMinutes(new Date(), this.LOCK_TIME_MINUTES);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
        },
      });
    }
  }

  private async resetFailedLoginAttempts(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  // Session Management
  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    await this.prisma.refreshToken.updateMany({
      where: { token: session.refreshToken },
      data: { isRevoked: true },
    });

    return { message: 'Session revoked successfully' };
  }

  async revokeAllSessions(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
    });

    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    const refreshTokens = sessions.map((s) => s.refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: {
        token: {
          in: refreshTokens,
        },
      },
      data: { isRevoked: true },
    });

    return { message: 'All sessions revoked successfully' };
  }
}
