import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { Estados } from 'src/estados/entities/estados.entity';
import { Task } from './entities/task.entity';
import { User } from 'src/auth/entities/user.entity';
import { TaskType } from './entities/tipoTask.enum';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Subtask } from 'src/sub-task/entities/sub-task.entity';
import { ColaboradoresService } from 'src/colaboradores/colaboradores.service';
import { ListaTaskFullDto } from './dto/listarTaskFull.dto';

@Injectable()
export class TasksService {

  constructor(

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Subtask)
    private readonly subTaskRepository: Repository<Subtask>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Estados)
    private readonly estadoRepository: Repository<Estados>,

    private colaboradorService: ColaboradoresService,
  ){}

  // ════════════════════════════════════════════════
  // 🧪 FUNC: Crea una tarea solo cuando el usuario tenga un token valido
  // ════════════════════════════════════════════════
  async createTask(createTaskDto: CreateTaskDto, user: User) {

    const { type, titulo, descripcion, startDate, endDate, createdAt  } = createTaskDto;

    const userTaskCount = await this.taskRepository.count({
      where: { creador: { id: user.id } },
    });

    if (userTaskCount >= 4) {
      throw new BadRequestException('No puedes crear más de 4 tareas');
    }

    const estadoInicial = await this.estadoRepository.findOne({
      where: { nombre: 'Creado' },
    });

    if (!estadoInicial) {
      throw new NotFoundException('El estado no se encuentra!!');
    }

    const isSimple = type === TaskType.SIMPLE;
    
    const nuevaTarea = this.taskRepository.create({
      titulo,
      descripcion,
      type,
      estados: estadoInicial,
      creador: user,
      ...(isSimple && { startDate, endDate }),
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });
    
    nuevaTarea.creador = { id: user.id } as User;
    
    const savedTask = await this.taskRepository.save(nuevaTarea);

    return {
      message: 'Tarea creada exitosamente',
      task: savedTask,
    };
  }

   async listarTask(user: User){

    try {

      const tasks = await this.taskRepository.find({
        where: { creador: { id: user.id } },
        relations: ['estados', 'subtasks'],
        order:{
          titulo: 'ASC',
          subtasks:{
            titulo: 'ASC'
          }
        },
        select: {
          id: true,
          titulo: true,
          descripcion: true,
          type: true,
          estados: {id: true, nombre: true }, 
          subtasks: { id: true, titulo: true },
          startDate: true,
          endDate:true,
          createdAt: true,
          completedAt: true
        },
      });

      return tasks;

    } catch (error) {
      if (error instanceof HttpException) {
        throw error; 
      }
  
      throw new BadRequestException('Error al listar tareas: ' + error.message);
    }

   }

  async listarTaskUserDetalist( user:User, taskId: string ){

    try {

      const listaTask = await this.taskRepository.findOne({
        where: {id: taskId, creador: { id: user.id }},
        relations: [
          'subtasks',
          'subtasks.estados',
          'subtasks.asignados',
          'estados'
        ],
        select:{
          id: true,
          titulo: true,
          descripcion: true,
          estados: true,
          subtasks: {    
            id: true,
            titulo: true,
            descripcion: true,
            startDate: true,
            endDate: true,
            estados: {       
              id: true,
              nombre: true
            },
            asignados: {
              id: true,
              nombre: true,
            },
            createdAt: true,
            updatedAt: true,
            completedAt: true,
          },
          startDate: true,
          endDate: true

        }
      });

        return listaTask;
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; 
      }
  
      throw new BadRequestException('Error al listar tareas: ' + error.message);
    } 
  }

  async verificarCloaborador(subtaskId: string, userId: string){

    const subtask = await this.subTaskRepository.findOne({
      where: {
        id: subtaskId,
        asignados: {
          id: userId,
        },
      },
      relations: ['asignados', 'task'],
    });

    if (!subtask) {
      throw new Error('No autorizado o la subtarea no existe');
    }
    return subtask;
  }

  async listarTaskColaborador(subtaskId: string, userId: string) {
    // Paso 1: verificar que el usuario está asignado a la subtask
     const subtask = await this.verificarCloaborador(subtaskId, userId);
    // Paso 2: traer la tarea con todas las subtareas y sus asignados
    try{

      const task = await this.taskRepository.findOne({
        where: { id: (await subtask).task.id },
        relations: [
          'subtasks',
          'subtasks.estados',
          'subtasks.asignados',
        ]
      });
  
      return {
        id: task!.id,
        titulo: task!.titulo,
        descripcion: task!.descripcion,
        subtasks: task!.subtasks.map(st => ({
          id: st.id,
          titulo: st.titulo,
          descripcion: st.descripcion,
          estados: {
            id: st.estados.id,
            nombre: st.estados.nombre,
          },
          startDate: st.startDate,
          endDate: st.endDate,
          asignados: st.asignados.map(a => ({
            nombre: a.nombre,
            // role lo excluyes simplemente no poniéndolo
          })),
          createdAt: st.createdAt,
          updatedAt: st.updatedAt,
          completedAt: st.completedAt,
        })),
      };

    }catch (error) {
      if (error instanceof HttpException) {
        throw error; 
      }
      throw new BadRequestException('Error al listar tareas: ' + error.message);
    }
  }

  async listarPorId(taskId: string, user:User){

    const task = await this.taskRepository.findOne({
      where: {id: taskId,  creador: {id: user.id} },
      relations:['subtasks'],
      select:{
        id: true,
        titulo: true,
        descripcion: true,
        subtasks: {          // Selecciona campos de las subtareas
            id: true,
            titulo: true,
            descripcion: true,
            startDate: true,
            endDate: true,
            estados: {         // Selecciona campos del estado de la subtarea
              id: true,
              nombre: true
            },
        },
        type: true,
        startDate: true,
        endDate: true,
        createdAt:true,
      }
    })
    return task;
  }

  async listarTaskConColaboradores(user: User, taskId: string): Promise<ListaTaskFullDto> {

    const tarea = await this.listarTaskUserDetalist(user, taskId);

     if(!tarea ){
      throw new NotFoundException('No se encontraron tareas por el');
     }

    const colaboradores = await this.colaboradorService.getColaboradores(user);

    return {
      tarea,
      colaboradores,
    };
  }

  async updateTask(id: string, dto: UpdateTaskDto, user: User) {
    const task = await this.taskRepository.findOne({
      where: { id, creador: { id: user.id } }
    });

    if (!task) throw new NotFoundException('Tarea no encontrada');

    const tipoAnterior = task.type; // Guardamos el tipo actual antes de modificarlo

    // Actualizar campos si están presentes
    Object.assign(task, {
      ...(dto.titulo !== undefined && { titulo: dto.titulo }),
      ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.startDate !== undefined && { startDate: dto.startDate }),
      ...(dto.endDate !== undefined && { endDate: dto.endDate }),
    });

    // Solo si pasa de SIMPLE → COMPOSITE, reseteamos el estado
    if (tipoAnterior === TaskType.SIMPLE && task.type === TaskType.COMPOSITE) {
      const estadoCreado = await this.estadoRepository.findOne({ where: { id: 1 } }); // ID del estado "creado"
      if (!estadoCreado) throw new NotFoundException('Estado "creado" no encontrado');
      task.estados = estadoCreado;
      task.completedAt = null; // Limpiar si estaba marcada como completada
    }

    const updatedTask = await this.taskRepository.save(task);

    return {
      message: "Tarea actualizada correctamente",
      task: updatedTask
    };
  }


  async actualizarEstado(taskId: string, estadoId: number) {

    const task = await this.taskRepository.findOne({ where: { id: taskId } });

    if (!task) throw new NotFoundException('Tarea no encontrada');

    const estado = await this.estadoRepository.findOne({ where: { id: estadoId } });

    if (!estado) throw new NotFoundException('Estado no encontrado');

    if (task.estados?.id === estadoId)
      throw new BadRequestException('La tarea ya tiene este estado');

    task.estados = estado;
    
    if(task.estados.id === 4){
      task.completedAt = new Date();
    }
    return this.taskRepository.save(task);
  }

  async deleteTask(taskId: string, user: User): Promise<{ message: string }> {

    const task = await this.taskRepository.findOne({
      where: { id: taskId, creador: { id: user.id } }
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada o no te pertenece');
    }

    await this.taskRepository.remove(task);

    return { message: 'Tarea eliminada con éxito' };
  }
}


