import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SmsService } from './sms.service';
import { SmsProcessor } from './sms.processor';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'sms',
    }),
  ],
  providers: [SmsService, SmsProcessor],
  exports: [SmsService],
})
export class SmsModule {}
