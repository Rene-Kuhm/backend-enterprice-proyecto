import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async sendEmail(userId: string, subject: string, message: string) {
    // TODO: Implement actual email sending with Nodemailer
    return this.prisma.notification.create({
      data: {
        userId,
        type: 'email',
        channel: 'email',
        subject,
        message,
        status: 'pending',
      },
    });
  }

  async sendSMS(userId: string, phone: string, message: string) {
    // TODO: Implement actual SMS sending with Twilio
    return this.prisma.notification.create({
      data: {
        userId,
        type: 'sms',
        channel: phone,
        message,
        status: 'pending',
      },
    });
  }

  async findAll(userId?: string) {
    return this.prisma.notification.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
