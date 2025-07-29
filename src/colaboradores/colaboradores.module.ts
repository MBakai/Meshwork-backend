import { Module } from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';
import { ColaboradoresController } from './colaboradores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Colaborador } from './entities/colaborador.entity';
import { User } from 'src/auth/entities/user.entity';
import { Roles } from 'src/roles/entities/roles.entity';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Colaborador, User, Roles ]),
    NotificacionesModule
  ],
  controllers: [ColaboradoresController],
  providers: [ColaboradoresService],
  exports:[TypeOrmModule, ColaboradoresService]
})
export class ColaboradoresModule {}
