import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseUUIDPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from 'src/auth/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateStatusDto } from './dto/update-estado.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('create-task')
  @Auth('admin','usuario')
  create(@Body() createTaskDto: CreateTaskDto,
        @GetUser() user: User) {
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Get('listarTasks')
  @Auth('admin','usuario')
  getTaskUser( @GetUser() user: User){
    return this.tasksService.listarTask(user)  
  }

  // @Get('listarTasksDetalis')
  // @Auth('admin','usuario')
  // getTaskUserDetalist( @GetUser() user: User){
  //   return this.tasksService.listarTaskUserDetalist(user)  
  // }

  @Get('get-for-id/:id')
  @Auth('admin', 'usuario')
  getForId(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) taskId: string
  ){
    return this.tasksService.listarPorId(taskId, user);
  }

  @Get('get-full/:id')
  @Auth('admin', 'usuario') // Igual que tus otros endpoints
    async obtenerTareasConColaboradores(
      @GetUser() user: User,
      @Param('id', ParseUUIDPipe) taskId: string) {
    return this.tasksService.listarTaskConColaboradores(user, taskId);
  }

  @Patch('update-task/:id')
  @Auth('admin','usuario')
  taskUpdate(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) taskId: string, 
    @Body() updateTaskDto: UpdateTaskDto) {
      return this.tasksService.updateTask(taskId, updateTaskDto, user);
  }

  @Patch('update-status/:id')
  @Auth('admin','usuario')
  actualizarEstado(
    @Param('id', ParseUUIDPipe) taskId: string, 
    @Body() dto: UpdateStatusDto) {
    return this.tasksService.actualizarEstado(taskId, dto.estadoId)
  }

  @Delete('remove/:id')
  @Auth('admin','usuario')
  removeTask(
    @GetUser() user:User,
    @Param( 'id', ParseUUIDPipe) id: string){
    return this.tasksService.deleteTask(id, user );
  }

}
