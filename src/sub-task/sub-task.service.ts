import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Estados } from 'src/estados/entities/estados.entity';
import { In, Repository } from 'typeorm';
import { Subtask } from './entities/sub-task.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';

@Injectable()
export class SubTaskService {

  constructor(

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Subtask)
    private readonly subTaskRepository: Repository<Subtask>,

    @InjectRepository(Estados)
    private readonly estadosRepository: Repository<Estados>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificacionesService: NotificacionesService,
  ){}

  readonly MAX_SUBTASKS = 5;

  async createSubTask(createSubTaskDto: CreateSubTaskDto, taskId: string) {

    console.log('datos:', createSubTaskDto);
    
    const idTask = await this.taskRepository.findOne({
      where: {id: taskId },
      relations: ['subtasks'] }) 

    if(!idTask)
      throw new NotFoundException('Task no encontrado o creado aún!!');

    const currentCount = idTask.subtasks.length;

    if (currentCount >= this.MAX_SUBTASKS) {
      throw new BadRequestException(`Solo se permiten ${this.MAX_SUBTASKS} subtareas por tarea`);
    }
    
    const {titulo, descripcion, startDate, endDate, createdAt} =  createSubTaskDto;

    const estadoInicial = await this.estadosRepository.findOne({
      where: {nombre: 'Creado'}
    });

    if(!estadoInicial)
      throw new NotFoundException('Estado no encontrado');

    const asignados = await this.validarYObtenerUsers(createSubTaskDto.asignados);
    

    const nuevoSubTask =  await this.subTaskRepository.create({
      titulo,
      descripcion,
      task: idTask,
      estados: estadoInicial,
      asignados,
      startDate,
      endDate,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    })

    const subTaskNuevo = await this.subTaskRepository.save( nuevoSubTask );


    return subTaskNuevo;
  }

  async listarSubtaskColaborador(user: User) {
  const subtasks = await this.subTaskRepository
    .createQueryBuilder('subtask')
    .leftJoin('subtask.asignados', 'asignado')
    .leftJoin('subtask.task', 'task')
    .leftJoin('task.creador', 'creador')
    .where('asignado.id = :userId', { userId: user.id })
    .select([
      'subtask.id AS subtaskId',
      'subtask.titulo AS subtasktitulo',
      'subtask.descripcion AS subtaskdescripcion',
      'task.id AS taskId',
      'task.titulo AS tasktitulo',
      'creador.nombre AS creadornombre' // Cambia "nombre" si es diferente
    ])
    .getRawMany();

  return subtasks;
}

  //ACTUALIZACION DE LA SUBTASK

  async update(id: string, updateSubTaskDto: UpdateSubTaskDto, user: User) {
    console.log('data de la subtask:', updateSubTaskDto);
    
    const subtask = await this.subTaskRepository.findOne({
      where: { id },
      relations: ['estados', 'task', 'asignados', 'task.creador'],
    });

    if (!subtask) {
      throw new NotFoundException(`Subtarea con id ${id} no encontrada`);
    }

    const esAsignado = subtask.asignados.some(asignado => asignado.id === user.id);

    const esCreadorTask = subtask.task.creador.id === user.id;

    //Si no es creador ni asignado → no tiene permiso
    if (!esAsignado && !esCreadorTask) {
      throw new ForbiddenException(`No tienes permiso para modificar esta subtarea`);
    }

    //Si es asignado pero no creador → solo puede cambiar estado
    if (esAsignado && !esCreadorTask) {
      if (!updateSubTaskDto.id_estado) {
        throw new ForbiddenException(`Solo puedes cambiar el estado de la subtarea`);
      }
      await this.actualizarEstado(subtask, updateSubTaskDto.id_estado, user);
      return await this.subTaskRepository.save(subtask);
    }

    //Si es creador → puede modificar todo
    this.actualizarCamposSimples(subtask, updateSubTaskDto);

    if (updateSubTaskDto.id_estado) {
      await this.actualizarEstado(subtask, updateSubTaskDto.id_estado, user);
    }

    if (updateSubTaskDto.asignados) {
      await this.manejarAsignados(subtask, updateSubTaskDto.asignados);
    }

    if (updateSubTaskDto.quitarAsignados?.length) {
      await this.manejarDesasignados(subtask, updateSubTaskDto.quitarAsignados);
    }

    return await this.subTaskRepository.save(subtask);
  }

  private actualizarCamposSimples(subtask: Subtask, dto: UpdateSubTaskDto) {

    const isCompleted = dto.id_estado === 4;

    Object.assign(
      subtask,
      Object.fromEntries(
        Object.entries({
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          startDate: dto.startDate,
          endDate: dto.endDate,
        }).filter(([_, value]) => value !== undefined) // solo se actualiza si no es undefined
      )
    );

    if (isCompleted && !subtask.completedAt) {
      subtask.completedAt = new Date();
    }
  }

  private async actualizarEstado(subtask: Subtask, id_estado: number, usuarioQueModifica: User) {

     const estadoAnterior = subtask.estados?.id;

    const estado = await this.estadosRepository.findOneBy({ id: id_estado });
    if (!estado) {
      throw new NotFoundException(`Estado con id ${id_estado} no encontrado`);
    }
    subtask.estados = estado;

    if(subtask.estados.id === 4){
      subtask.completedAt = new Date();
    }

    // Si cambió el estado, enviar notificación
    if (estadoAnterior !== id_estado) {
      const usuariosRelacionados = [
        ...subtask.asignados,
        subtask.task.creador
      ].filter(u => u.id !== usuarioQueModifica.id);;
      // Evitar duplicados
      const usuariosUnicos = usuariosRelacionados.filter(
        (u, i, arr) => arr.findIndex(x => x.id === u.id) === i
      );

      for (const usuario of usuariosUnicos) {
        await this.notificacionesService.notificacionEstadoAvanzado(
          subtask,
          estado.nombre,
          usuario,
          usuarioQueModifica
        );
      }
    }

  }

  private async manejarAsignados(subtask: Subtask, asignadosIds: string[]) {

    const nuevosAsignados = await this.validarYObtenerUsers(asignadosIds);

    const asignadosPreviosIds = subtask.asignados.map(u => u.id);

    const usuariosNuevos = nuevosAsignados.filter(u => !asignadosPreviosIds.includes(u.id));

    // Agregar nuevos sin eliminar los anteriores
    subtask.asignados.push(...usuariosNuevos);

    for (const usuario of usuariosNuevos) {
      await this.notificacionesService.notificarAsignacionASubtarea(subtask, usuario);
    }
  }

  private async manejarDesasignados(subtask: Subtask, quitarIds: string[]) {
    const usuariosDesasignados = subtask.asignados.filter(u => quitarIds.includes(u.id));

    subtask.asignados = subtask.asignados.filter(u => !quitarIds.includes(u.id));

    for (const usuario of usuariosDesasignados) {
      await this.notificacionesService.notificarDesasignacionASubtarea(subtask, usuario);
    }
  }
  //FIN DE LA ACTUALIZACION DE LAS SUBTASK

  private async validarYObtenerUsers( userIds?: string[] ): Promise<User[]> {
     
    if (!userIds || userIds.length === 0) return [];
    
    const users = await this.userRepository.findBy({ 
      id: In([...userIds]) // Spread operator para conversión segura
    });
    console.log('usuarios de esta sub tarea', users);
    
    if (users.length !== userIds.length) {
      
      const idDesaparecido = userIds.filter(id => !users.some(u => u.id === id));

      throw new NotFoundException(`Usuarios no encontrados: ${idDesaparecido.join(', ')}`);
    }
    
    return users;
  }

  // updateEstado.ts
  // async updateEstado(id: string, updateSubTaskDto: UpdateEstadoSubTaskDto, usuarioActual: User) {
  // // 1. Buscar la subtarea con relaciones
  // const subtask = await this.subTaskRepository.findOne({
  //   where: { id },
  //   relations: ['asignados', 'estados', 'task']
  // });

  // if (!subtask) {
  //   throw new NotFoundException('Subtarea no encontrada');
  // }

  // // 2. Verificar que el usuario actual está asignado
  // const usuarioEstaAsignado = subtask.asignados.some(u => u.id === usuarioActual.id);
  //   if (!usuarioEstaAsignado) {
  //     throw new ForbiddenException('No estás asignado a esta subtarea');
  //   }

  //   // 3. Actualizar estado si viene en el DTO
  //   if (updateSubTaskDto.id_estado) {
  //     const nuevoEstado = await this.estadosRepository.findOne({ 
  //       where: { id: updateSubTaskDto.id_estado } 
  //     });

  //     if (!nuevoEstado) {
  //       throw new NotFoundException('Estado no encontrado');
  //     }

  //     subtask.estados = nuevoEstado;
  //   }

  //   // 4. Actualizar asignados si viene en el DTO
  //   if (updateSubTaskDto.asignados) {
  //     subtask.asignados = await this.userRepository.findBy({
  //       id: In(updateSubTaskDto.asignados)
  //     });
  //   }

  //   // 5. Guardar cambios
  //   const subtaskActualizada = await this.subTaskRepository.save(subtask);

  //   // 6. Notificar cambios (si hubo cambio de estado)
  //   if (updateSubTaskDto.id_estado && subtask.asignados?.length > 0) {
  //     await this.notificarCambioDeEstado(
  //       subtaskActualizada, 
  //       usuarioActual, 
  //       subtaskActualizada.estados?.nombre
  //     );
  //   }

  //   return subtaskActualizada;
  // }

  // private async notificarCambioDeEstado(subtask: Subtask, usuarioActual: User, nuevoEstado?: string) {
  //   const destinatarios = subtask.asignados.filter(u => u.id !== usuarioActual.id);

  //   for (const usuario of destinatarios) {
  //     await this.notificacionesService.notificacionEstadoAvanzado(
  //       subtask, 
  //       usuarioActual, 
  //       nuevoEstado
  //     );
  //   }
  // }

  async deleteTask(subTaskId: string, user: User): Promise<{ message: string }> {
    const subtask = await this.subTaskRepository.findOne({
      where: { id: subTaskId },
      relations: ['task', 'task.creador', 'asignados'], 
    });

    // 2. Verificar existencia y permisos
    if (!subtask || subtask.task.creador.id !== user.id) {
      throw new NotFoundException(
        'Subtarea no encontrada o no tienes permiso para eliminarla',
      );
    }

    if (subtask.asignados && subtask.asignados.length > 0) {
      throw new ConflictException(
        'No se puede eliminar la subtarea porque tiene usuarios asignados',
      );
    }

    await this.subTaskRepository.remove(subtask);

    return { message: 'Subtarea eliminada con éxito' };
  }
}
