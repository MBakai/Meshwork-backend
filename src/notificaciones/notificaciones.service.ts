import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notificacione } from './entities/notificacione.entity';
import { LessThan, Repository } from 'typeorm';
import { NotificationsGateway } from 'src/notificaciones/notifications.gateway';
import { Opciones } from './entities/opciones.interface';
import { TypeNotification } from './entities/type-notification.enum';
import { Subtask } from 'src/sub-task/entities/sub-task.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class NotificacionesService {

  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(Notificacione)
    private notificacionRepository: Repository<Notificacione>,
    private gateway: NotificationsGateway
  ) {}

  async obtenerPorUsuario(userId: string) {
    return this.notificacionRepository.find({
      where: [
        // No leída y no procesada
        {
          usuario: { id: userId },
          leida: false,
          procesada: false
        },
        {
          usuario: { id: userId },
          leida: false,
          procesada: true
        },
        // Leída pero no procesada
        {
          usuario: { id: userId },
          leida: true,
          procesada: false
        }
      ],
      order: { createdAt: 'DESC' }
    });
  }

  async enviarNotificacion(opciones: Opciones) {

    const notificacion = this.notificacionRepository.create({
      titulo: opciones.titulo,
      tipo: opciones.tipo,
      mensaje: opciones.mensaje,
      usuario: opciones.para,
      data: opciones.data,
      leida: opciones.leida,
      procesada: opciones.procesada
    });

    console.log(notificacion);
    

    await this.notificacionRepository.save(notificacion);

    // Emitir por WebSocket
    this.gateway.emitirNotificacionAlUsuario(opciones.para, notificacion);
  }

  async marcarComoLeidaYProcesada(solicitudId: string, destinatarioId: string) {
    const notificacion = await this.notificacionRepository.findOne({
      where: {
        tipo: TypeNotification.SOLICITUD_ENVIADA,
        usuario: { id: destinatarioId },
        data: { solicitudId } 
      }
    });

    if (notificacion) {
      notificacion.leida = true;
      notificacion.procesada = true;
      await this.notificacionRepository.save(notificacion);
    }
  }

  async marcarTodasComoLeidas(userId: string) {

    const result = await this.notificacionRepository.update(
      { usuario: { id: userId } },
      { leida: true }
    );

    return {
      message: `Se marcaron ${result.affected} notificaciones como leídas`
    };
  }

  async marcarComoLeida(notificacionId: string, userId: string) {
    const result = await this.notificacionRepository.update(
      {
        id: notificacionId,
        usuario: { id: userId }
      },
      { leida: true }
    );

    return {
      message: result.affected === 1
        ? 'Notificación marcada como leída'
        : 'No se encontró la notificación o ya estaba leída'
    };
  }

  async contarNoLeidas(userId: string) {
    const noLeidas = await this.notificacionRepository.count({
      where: {
        usuario: {
          id: userId
        },
        leida: false,
      }
    });
    return { noLeidas };
  }


  async notificarAsignacionASubtarea(subtask: Subtask, usuario: User) {
    await this.enviarNotificacion({
      titulo: 'Has sido asignado a una tarea',
      tipo: TypeNotification.ASIGNADO,
      para: usuario,
      leida: false,
      procesada: true,
      mensaje: `Te han asignado la subtarea "${subtask.titulo}" en la tarea "${subtask.task.titulo}"`,
      data: {
        taskId: subtask.task.id,
        subTaskId: subtask.id
      },
    });
  }

  async notificarDesasignacionASubtarea(subtask: Subtask, usuario: User) {
    await this.enviarNotificacion({
      titulo: 'Has sido desasignado de una tarea',
      tipo: TypeNotification.DESASIGNADO,
      para: usuario,
      leida: false,
      procesada: true,
      mensaje: `Has sido desasignado de la subtarea "${subtask.titulo}" en la tarea "${subtask.task.titulo}"`,
      data: {
        taskId: subtask.task.id,
        subTaskId: subtask.id
      },
    });
  }

  async notificacionEstadoAvanzado(subtask: Subtask, nuevoEstado: string, usuarioNotificado: User, usuarioQueModifica: User){
    await this.enviarNotificacion({
      titulo: 'Avance en la tarea',
      tipo: TypeNotification.TAREA_AVANZADA,
      para: usuarioNotificado,
      leida: false,
      procesada: true,
      mensaje: `${usuarioQueModifica.nombre} cambió la subtarea "${subtask.titulo}" al estado "${nuevoEstado}"`,
      data: {
        subTaskId: subtask.id
      },
    });
  }

  async cleanupOldNotificaciones(): Promise<void> {
      const fechaLimite = new Date();
      // ejemplo: borrar notificaciones de hace más de N días segun sea requerido
      fechaLimite.setDate(fechaLimite.getDate() - 1);
  
      // Buscar notificaciones que estén leídas y procesadas
      const oldNotifications = await this.notificacionRepository.find({
        where: {
          leida: true,
          procesada: true,
          createdAt: LessThan(fechaLimite),
        },
      });
  
      if (oldNotifications.length === 0) return;
  
      await this.notificacionRepository.remove(oldNotifications);
  
      console.log(`Eliminadas ${oldNotifications.length} notificaciones antiguas`);
    }

}
