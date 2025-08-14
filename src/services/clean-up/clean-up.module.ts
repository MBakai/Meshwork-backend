import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SendEmailModule } from 'src/send-email/send-email.module';
import { CleanupService } from './cleanup.service';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SendEmailModule,
    NotificacionesModule
  ],
  providers:[CleanupService]
})
export class CleanUpModule {}
