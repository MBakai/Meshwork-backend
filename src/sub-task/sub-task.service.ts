import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Estados } from 'src/estados/entities/estados.entity';
import { In, Repository } from 'typeorm';
import { Subtask } from './entities/sub-task.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { cleanObject } from 'src/utils/cleanUpDto';

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
    private readonly userRepository: Repository<User>
  ){}

  readonly MAX_SUBTASKS = 5;

  async createSubTask(createSubTaskDto: CreateSubTaskDto, taskId: string) {

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

  async update(id: string, updateSubTaskDto: UpdateSubTaskDto) {

    const subtask = await this.subTaskRepository.findOne({
      where: { id },
      relations: ['estados', 'task', 'asignados'],
    });
  
    if (!subtask) {
      throw new NotFoundException(`Subtarea con id ${id} no encontrada`);
    }
    console.log(updateSubTaskDto.asignados);
    
    const isCompleted = updateSubTaskDto.id_estado === 4;
    
    // Actualizar campos simples
    Object.assign(subtask, cleanObject({
      titulo: updateSubTaskDto.titulo,
      descripcion: updateSubTaskDto.descripcion,
      startDate: updateSubTaskDto.startDate ?? null,
      endDate: updateSubTaskDto.endDate ?? null,
    }));
    
    if (isCompleted && !subtask.completedAt) {
      subtask.completedAt = new Date();
    }

    if (updateSubTaskDto.id_estado) {
      const estado = await this.estadosRepository.findOneBy({ id: updateSubTaskDto.id_estado });
      if (!estado) {
        throw new NotFoundException(`Estado con id ${updateSubTaskDto.id_estado} no encontrado`);
      }
      subtask.estados = estado;
    }
  
    // Actualizar asignados 
    if (updateSubTaskDto.asignados) {
      subtask.asignados = await this.validarYObtenerUsers(updateSubTaskDto.asignados);
    }

    if (updateSubTaskDto.quitarAsignados?.length) {
        subtask.asignados = subtask.asignados.filter(u => !updateSubTaskDto.quitarAsignados?.includes(u.id));
      }
  
    return await this.subTaskRepository.save(subtask);
  }

  private async validarYObtenerUsers( userIds?: string[] ): Promise<User[]> {
    
    if (!userIds || userIds.length === 0) return [];
    
    const users = await this.userRepository.findBy({ 
      id: In([...userIds]) // Spread operator para conversión segura
    });
    
    if (users.length !== userIds.length) {
      
      const idDesaparecido = userIds.filter(id => !users.some(u => u.id === id));

      throw new NotFoundException(`Usuarios no encontrados: ${idDesaparecido.join(', ')}`);
    }
    
    return users;
  }

  async deleteTask(subTaskId: string, user: User): Promise<{ message: string }> {
  
    const subtask = await this.subTaskRepository.findOne({
      where: { id: subTaskId },
      relations: ['task', 'task.creador']
    });
  
    if (!subtask || subtask.task.creador.id !== user.id) {
      throw new NotFoundException('Subtarea no encontrada o no tienes permiso para eliminarla');
    }
  
    await this.subTaskRepository.remove(subtask);
  
    return { message: 'Tarea eliminada con éxito' };
  }
}
