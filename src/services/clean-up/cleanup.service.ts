import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SendEmailService } from '../../send-email/send-email.service';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';

@Injectable()
export class CleanupService {
    constructor(private verificacionesCorreoService: SendEmailService,
      private notificacionesService: NotificacionesService
    ) {}

  // Ejecutar cada hora para limpiar usuarios no verificados
  @Cron(CronExpression.EVERY_12_HOURS)
  async handleCleanupUnverifiedUsers() {
    console.log('Ejecutando limpieza de usuarios no verificados...');
    await this.verificacionesCorreoService.cleanupUnverifiedUsers();
  }

  // Cada hora → solicitudes de recuperación expiradas
  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanupUnverifiedPassword() {
    console.log('Limpieza de solicitudes de cambio de contraseña expiradas...');
    await this.verificacionesCorreoService.cleanupUnverifiedPasswordResets();
  }
   // Cada día a la medianoche -> notificaciones leidas y procesadas
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications() {
    console.log('Ejecutando limpieza de notificaciones leidas y procesadas...');
    await this.notificacionesService.cleanupOldNotificaciones();
    
  }

}
