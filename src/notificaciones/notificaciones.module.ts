import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacione } from './entities/notificacione.entity';
import { NotificationsGateway } from 'src/notificaciones/notifications.gateway';
import { User } from 'src/auth/entities/user.entity';
import { Subtask } from 'src/sub-task/entities/sub-task.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Notificacione, User, Subtask]),
      NotificationsGateway
    ],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, NotificationsGateway],
  exports:[NotificacionesService, TypeOrmModule]
})
export class NotificacionesModule {}
