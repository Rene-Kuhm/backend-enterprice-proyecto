import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { SmsService, SmsOptions } from './sms.service';

@Processor('sms')
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(private readonly smsService: SmsService) {}

  @Process('send-sms')
  async handleSendSms(job: Job<SmsOptions>) {
    this.logger.log(`Processing SMS job ${job.id} for ${job.data.to}`);

    try {
      await this.smsService.sendSms(job.data);
      this.logger.log(`SMS job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(
        `SMS job ${job.id} failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
