import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as twilio from 'twilio';

export interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: twilio.Twilio;
  private readonly fromNumber: string;

  constructor(
    private configService: ConfigService,
    @InjectQueue('sms') private smsQueue: Queue,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials not configured');
    }
  }

  async sendSms(options: SmsOptions): Promise<void> {
    try {
      if (!this.twilioClient) {
        throw new Error('Twilio client not initialized');
      }

      const result = await this.twilioClient.messages.create({
        body: options.message,
        from: this.fromNumber,
        to: options.to,
      });

      this.logger.log(`SMS sent successfully to ${options.to}. SID: ${result.sid}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${options.to}`, error.stack);
      throw error;
    }
  }

  async queueSms(options: SmsOptions, delay: number = 0): Promise<void> {
    await this.smsQueue.add('send-sms', options, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    this.logger.log(`SMS queued for ${options.to}`);
  }

  async send2FACode(phone: string, code: string): Promise<void> {
    await this.queueSms({
      to: phone,
      message: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
    });
  }

  async sendPasswordResetCode(phone: string, code: string): Promise<void> {
    await this.queueSms({
      to: phone,
      message: `Your password reset code is: ${code}. This code will expire in 15 minutes.`,
    });
  }

  async sendLoginAlert(phone: string, location: string): Promise<void> {
    await this.queueSms({
      to: phone,
      message: `New login detected from ${location}. If this wasn't you, please secure your account immediately.`,
    });
  }
}
