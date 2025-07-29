import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SendEmailModule } from 'src/send-email/send-email.module';
import { CleanupService } from './cleanup.service';

@Module({
    imports: [
    ScheduleModule.forRoot(),
    SendEmailModule,
  ],
  providers:[CleanupService]
})
export class CleanUpModule {}
