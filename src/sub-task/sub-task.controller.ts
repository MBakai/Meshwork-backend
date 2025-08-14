import { Controller, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Get } from '@nestjs/common';
import { SubTaskService } from './sub-task.service';
import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { UpdateEstadoSubTaskDto } from './dto/update-estado.dto';

@Controller('sub-task')
export class SubTaskController {
  constructor(private readonly subTaskService: SubTaskService) {}

  @Post('create/:taskId')
  @Auth('admin','usuario')
  create(
    @Param('taskId') taskId: string, 
    @Body() createSubTaskDto: CreateSubTaskDto) {
    return this.subTaskService.createSubTask(createSubTaskDto, taskId);
  }

  @Get('get-subtask')
  @Auth('admin', 'usuario')
    async obtenerTareasConColaboradores(
      @GetUser() user: User) {
    return this.subTaskService.listarSubtaskColaborador(user);
  }

  @Patch('update/:id')
  @Auth('admin','usuario')
  update(@GetUser() user: User, @Param('id') id: string, @Body() updateSubTaskDto: UpdateSubTaskDto) {
    return this.subTaskService.update(id, updateSubTaskDto, user);
  }

  // @Patch('update/:id')
  // @Auth('admin','usuario')
  // updateStatusSubtask(@Param('id') id: string, @Body() updateSubTaskDto: UpdateEstadoSubTaskDto, @GetUser() user: User) {
  //   return this.subTaskService.updateEstado(id, updateSubTaskDto, user);
  // }

  @Delete('remove/:id')
  @Auth('admin','usuario')
  removeTask(
    @GetUser() user:User,
    @Param( 'id', ParseUUIDPipe) id: string){
    return this.subTaskService.deleteTask(id, user );
  }
}
