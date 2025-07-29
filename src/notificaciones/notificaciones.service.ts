import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notificacione } from './entities/notificacione.entity';
import { Repository } from 'typeorm';
import { NotificationsGateway } from 'src/notificaciones/notifications.gateway';
import { Opciones } from './entities/opciones.interface';
import { TypeNotification } from './entities/type-notification.enum';

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
}
