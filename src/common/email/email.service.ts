import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let html = options.html;

      if (options.template && options.context) {
        html = await this.renderTemplate(options.template, options.context);
      }

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: options.to,
        subject: options.subject,
        html,
        text: options.text,
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error.stack);
      throw error;
    }
  }

  async queueEmail(options: EmailOptions, delay: number = 0): Promise<void> {
    await this.emailQueue.add(
      'send-email',
      options,
      {
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    this.logger.log(`Email queued for ${options.to}`);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.queueEmail({
      to: email,
      subject: 'Welcome to Enterprise API',
      template: 'welcome',
      context: {
        name,
        appName: 'Enterprise API',
        year: new Date().getFullYear(),
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get('APP_URL')}/verify-email?token=${token}`;

    await this.queueEmail({
      to: email,
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      context: {
        name,
        verificationUrl,
        appName: 'Enterprise API',
        year: new Date().getFullYear(),
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${token}`;

    await this.queueEmail({
      to: email,
      subject: 'Reset Your Password',
      template: 'password-reset',
      context: {
        name,
        resetUrl,
        appName: 'Enterprise API',
        year: new Date().getFullYear(),
      },
    });
  }

  async send2FACodeEmail(
    email: string,
    name: string,
    code: string,
  ): Promise<void> {
    await this.queueEmail({
      to: email,
      subject: 'Your 2FA Code',
      template: '2fa-code',
      context: {
        name,
        code,
        appName: 'Enterprise API',
        year: new Date().getFullYear(),
      },
    });
  }

  async sendPasswordChangedEmail(email: string, name: string): Promise<void> {
    await this.queueEmail({
      to: email,
      subject: 'Password Changed Successfully',
      template: 'password-changed',
      context: {
        name,
        appName: 'Enterprise API',
        year: new Date().getFullYear(),
      },
    });
  }

  private async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template ${templateName} not found`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);

    return template(context);
  }
}
