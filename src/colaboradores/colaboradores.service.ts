import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Colaborador } from './entities/colaborador.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Not, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ColaboradorDto } from './dto/colaborador.dto';
import { SolicitudDTO } from './dto/solicitudes.dto';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';
import { TypeNotification } from 'src/notificaciones/entities/type-notification.enum';

@Injectable()
export class ColaboradoresService {

  constructor(
    @InjectRepository(Colaborador)
    private readonly colaboradorRepository: Repository<Colaborador>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificacionesService: NotificacionesService
  ){}
  

  // ════════════════════════════════════════════════
  // 🧪 FUNC: Enviar solicitudes de amigo
  // ════════════════════════════════════════════════
  async enviarSolicitud(solicitanteId: string, destinatarioId: string): Promise<{ ok: true, message: string }> {
    if (solicitanteId === destinatarioId) {
      throw new BadRequestException('No puedes enviarte solicitud a ti mismo');
    }

    // 👇 Cargamos al solicitante para usar su nombre
    const solicitante = await this.userRepository.findOneBy({ id: solicitanteId });
    if (!solicitante) {
      throw new NotFoundException('Solicitante no encontrado');
    }

     // Verificar si ya existe una solicitud activa
    const existeSolicitud = await this.colaboradorRepository.findOne({
      where: [
        {
          solicitante: { id: solicitanteId },
          destinatario: { id: destinatarioId },
          status: In(['pendiente', 'aceptada']),
        },
        {
          solicitante: { id: destinatarioId },
          destinatario: { id: solicitanteId },
          status: In(['pendiente', 'aceptada']),
        }
      ],
    });

    if (existeSolicitud) {
      throw new BadRequestException('Ya has enviado una solicitud activa a este usuario');
    }

    const solicitud = this.colaboradorRepository.create({
      solicitante: { id: solicitanteId },
      destinatario: { id: destinatarioId },
      status: 'pendiente',
    });

    await this.colaboradorRepository.save(solicitud);

    await this.notificacionesService.enviarNotificacion({
      titulo:'Colaboración',
      tipo: TypeNotification.SOLICITUD_ENVIADA,
      para: solicitud.destinatario,
      leida: false,
      procesada: false,
      mensaje: `${solicitante.nombre} te ha enviado una solicitud de colaboración.`,
      data: {
        solicitudId: solicitud.id,
      },
    });

    return {ok: true, message: 'solicitud enviada con exito'}
  }

  // ════════════════════════════════════════════════
  // 🧪 FUNC: aceptar solicitudes
  // ════════════════════════════════════════════════
  async aceptarSolicitud(idSolicitud: string, user: User): Promise<{ok: true, message: string}> {

    // 1. Buscar la solicitud con relaciones necesarias
    const solicitud = await this.colaboradorRepository.findOne({

      where: { id: idSolicitud },
      relations: ['destinatario','solicitante'], // Solo cargamos la relación necesaria
    });

    // 2. Validaciones
    if (!solicitud) {
      throw new NotFoundException('Solicitud de colaboración no encontrada');
    }

    if (solicitud.destinatario.id !== user.id) {
      throw new ForbiddenException('No eres el destinatario de esta solicitud');
    }

    if (solicitud.status !== 'pendiente') {
      throw new BadRequestException(`La solicitud ya fue ${solicitud.status}`);
    }

    // 3. Actualización
    solicitud.status = 'aceptada';
    solicitud.updateAt = new Date(); // Actualizamos automáticamente

    // 4. Guardar cambios
    try {
      await this.colaboradorRepository.save(solicitud);

      await this.notificacionesService.enviarNotificacion({
        titulo: 'Colaboración aceptada',
        tipo: TypeNotification.SOLICITUD_ACEPTADA,
        para: solicitud.solicitante,
        leida: false,
        procesada: true,
        mensaje: `${solicitud.destinatario.nombre} aceptó tu solicitud de colaboración.`,
        data: {
          solicitudId: solicitud.id
        }
      });

      await this.notificacionesService.marcarComoLeidaYProcesada(solicitud.id, solicitud.destinatario.id);

      return {ok: true, message: 'Solicitud aceptada con exito'};

    } catch (error) {
      console.error('Error al guardar solicitud:', error);
      throw new BadRequestException('Error al actualizar la solicitud');
    }
  }

  // ════════════════════════════════════════════════
  // 🧪 FUNC: rechazar solicitud
  // ════════════════════════════════════════════════
  async rechazarSolicitud(idSolicitud: string, user: User): Promise<{ok: true, message: string}> {

    // 1. Buscar la solicitud con relaciones necesarias
    const solicitud = await this.colaboradorRepository.findOne({

      where: { id: idSolicitud },
      relations: ['destinatario', 'solicitante'],
    });

    // 2. Validaciones
    if (!solicitud) {
      throw new NotFoundException('Solicitud de colaboración no encontrada');
    }

    if (solicitud.destinatario.id !== user.id) {
      throw new ForbiddenException('No eres el destinatario de esta solicitud');
    }

    if (solicitud.status !== 'pendiente') {
      throw new BadRequestException(`La solicitud ya fue ${solicitud.status}`);
    }

    
    solicitud.status = 'rechazada';
    solicitud.updateAt = new Date(); 

    try {
      await this.colaboradorRepository.save(solicitud);

      await this.notificacionesService.enviarNotificacion({
        titulo: 'Colaboración rechazada',
        tipo: TypeNotification.SOLICITUD_RECHAZADA,
        para: solicitud.solicitante,
        leida: false,
        procesada: true,
        mensaje: `${solicitud.destinatario.nombre} rechazó tu solicitud de colaboración.`,
        data: {
          solicitudId: solicitud.id
        }
      });

      await this.notificacionesService.marcarComoLeidaYProcesada(solicitud.id, solicitud.destinatario.id);

      return { ok: true, message: 'Solicitud rechazada con exito' };

    } catch (error) {
      throw new BadRequestException('Error al actualizar la solicitud');
    }
  }
  
  // ════════════════════════════════════════════════
  // 🧪 FUNC: ver o obtener todas las solicitudes
  // ════════════════════════════════════════════════
  async obtenerSolicitudesPendientes(userId: string): Promise<SolicitudDTO[]> {
    
    const solicitudes =  await this.colaboradorRepository
      .createQueryBuilder('colaborador')
      .leftJoinAndSelect('colaborador.solicitante', 'solicitante')
      .leftJoinAndSelect('colaborador.destinatario', 'destinatario')
      .where('(solicitante.id = :userId OR destinatario.id = :userId)', { userId })
      .andWhere('colaborador.status = :status', { status: 'pendiente' })
      .orderBy('colaborador.createdAt', 'DESC')
      .getMany();
      
      return solicitudes.map(solicitud => ({
        id: solicitud.id,
        status: solicitud.status,
        createdAt: solicitud.createdAt,
        updateAt: solicitud.updateAt,
        solicitante: {
          id: solicitud.solicitante.id,
          nombre: solicitud.solicitante.nombre,
          email: solicitud.solicitante.email
        },
        destinatario: {
          id: solicitud.destinatario.id,
          nombre: solicitud.destinatario.nombre,
          email: solicitud.destinatario.email
        }
      }));
  }

  async getColaboradores(user: User): Promise<ColaboradorDto[]> {
    
    const colaboraciones = await this.colaboradorRepository.find({
      where: [
        { solicitante: { id: user.id }, status: 'aceptada' },
        { destinatario: { id: user.id }, status: 'aceptada' }
      ],
      relations: ['solicitante', 'destinatario']
    });

    return colaboraciones.map(colab => {
      const colaborador = colab.solicitante.id === user.id 
        ? colab.destinatario 
        : colab.solicitante;
      
      return {
        id: colaborador.id,
        nombre: colaborador.nombre,
        email: colaborador.email
      };
    });
  }

  async buscarColaboradorEmail(email: string, currentUserId: string) {
    // 1. Buscar usuarios que coincidan con el correo
    const usuarios = await this.userRepository.find({
      where: {
        email: ILike(`%${email}%`),
        id: Not(currentUserId),
      },
      take: 10,
    });

    if (!usuarios.length) return [];

    // 2. Obtener IDs de los usuarios encontrados
    const ids = usuarios.map(u => u.id);

    // Buscar TODAS las solicitudes entre el usuario actual y los encontrados
    const solicitudes = await this.colaboradorRepository.find({
      where: [
        { solicitante: { id: currentUserId }, destinatario: { id: In(ids) } },
        { solicitante: { id: In(ids) }, destinatario: { id: currentUserId } },
      ],
      relations: ['solicitante', 'destinatario'],
    });
    
    const estadoPorUsuario = new Map<string, { status: string; solicitanteId: string }>();

    for (const s of solicitudes) {
      const otroUsuarioId =
        s.solicitante.id === currentUserId ? s.destinatario.id : s.solicitante.id;

      estadoPorUsuario.set(otroUsuarioId, {
        status: s.status,
        solicitanteId: s.solicitante.id,
      });
    }
    // 5. Devolver usuarios con estadoSolicitud
    return usuarios.map(u => {
      const relacion = estadoPorUsuario.get(u.id);

      return {
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        estadoSolicitud: relacion?.status ?? null,
        fueEnviadaPorMi: relacion ? relacion.solicitanteId === currentUserId : false
        };
    });
  }
}
