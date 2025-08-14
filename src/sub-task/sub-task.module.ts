import { Module } from '@nestjs/common';
import { SubTaskService } from './sub-task.service';
import { SubTaskController } from './sub-task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subtask } from './entities/sub-task.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Estados } from 'src/estados/entities/estados.entity';
import { User } from 'src/auth/entities/user.entity';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Subtask, Task, Estados, User ]),
    NotificacionesModule
  ],
  controllers: [SubTaskController],
  providers: [SubTaskService],

  exports: [ TypeOrmModule, SubTaskModule ]
})
export class SubTaskModule {}
