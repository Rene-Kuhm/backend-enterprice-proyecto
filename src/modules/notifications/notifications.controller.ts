import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('email')
  @ApiOperation({ summary: 'Send email notification' })
  sendEmail(@Body() data: { userId: string; subject: string; message: string }) {
    return this.notificationsService.sendEmail(data.userId, data.subject, data.message);
  }

  @Post('sms')
  @ApiOperation({ summary: 'Send SMS notification' })
  sendSMS(@Body() data: { userId: string; phone: string; message: string }) {
    return this.notificationsService.sendSMS(data.userId, data.phone, data.message);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  findAll(@Query('userId') userId?: string) {
    return this.notificationsService.findAll(userId);
  }
}
