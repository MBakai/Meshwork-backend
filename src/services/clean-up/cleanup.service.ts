import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SendEmailService } from '../../send-email/send-email.service';

@Injectable()
export class CleanupService {
    constructor(private verificacionesCorreoService: SendEmailService) {}

  // Ejecutar cada hora para limpiar usuarios no verificados
  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanupUnverifiedUsers() {
    console.log('Ejecutando limpieza de usuarios no verificados...');
    await this.verificacionesCorreoService.cleanupUnverifiedUsers();
  }

}
