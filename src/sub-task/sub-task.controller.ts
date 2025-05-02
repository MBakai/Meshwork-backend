import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubTaskService } from './sub-task.service';
import { CreateSubTaskDto } from './dto/create-sub-task.dto';
import { UpdateSubTaskDto } from './dto/update-sub-task.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('sub-task')
export class SubTaskController {
  constructor(private readonly subTaskService: SubTaskService) {}

  @Post('create')
  @Auth('usuario')
  create(
    @GetUser() user: User,
    @Param('taskId') taskId: string, 
    @Body() createSubTaskDto: CreateSubTaskDto) {
    return this.subTaskService.createSubTask(createSubTaskDto, taskId);
  }


  @Patch('update/:id')
  @Auth('usuario')
  update(@Param('id') id: string, @Body() updateSubTaskDto: UpdateSubTaskDto) {
    return this.subTaskService.update(id, updateSubTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subTaskService.remove(+id);
  }
}
