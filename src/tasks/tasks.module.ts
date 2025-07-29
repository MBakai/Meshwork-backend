import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuthModule } from 'src/auth/auth.module';
import { EstadosModule } from 'src/estados/estados.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from 'src/auth/entities/user.entity';
import { Roles } from 'src/roles/entities/roles.entity';
import { Subtask } from 'src/sub-task/entities/sub-task.entity';
import { SubTaskModule } from 'src/sub-task/sub-task.module';
import { Colaborador } from 'src/colaboradores/entities/colaborador.entity';
import { ColaboradoresModule } from 'src/colaboradores/colaboradores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Subtask, User, Roles, Colaborador]),
    EstadosModule, AuthModule, SubTaskModule, ColaboradoresModule
  ],
  controllers: [
    TasksController
  ],
  providers: [
    TasksService
  ],
})
export class TasksModule {}
