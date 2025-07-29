import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { SendEmailService } from './send-email.service';

@Controller('send-email')
export class SendEmailController {
  constructor(private readonly sendEmailService: SendEmailService) {}

  @Get('mail-account')
  @HttpCode(HttpStatus.OK)
  async verifyAccount(@Query('token') token: string) {
    return this.sendEmailService.verifyAccount(token);
  }
}
