import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { GeneroModule } from './genero/genero.module';
import { EstadosModule } from './estados/estados.module';
import { TasksModule } from './tasks/tasks.module';
import { RolesModule } from './roles/roles.module';
import { ColaboradoresModule } from './colaboradores/colaboradores.module';
import { SubTaskModule } from './sub-task/sub-task.module';
import { NodemailerModule } from './services/nodemailer/nodemailer.module';
import { TemplateModule } from './services/template/template.module';
import { SendEmailModule } from './send-email/send-email.module';
import { CleanUpModule } from './services/clean-up/clean-up.module';
import { CleanupService } from './services/clean-up/cleanup.service';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { NotificationsGateway } from './notificaciones/notifications.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      
      type: 'postgres',
      port: +process.env.DB_PORT!,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      username: process.env.DB_USERNAME,
      autoLoadEntities: true,
      synchronize: true // Solo para desarrollo
    }),

    AuthModule,
    GeneroModule,
    EstadosModule,
    TasksModule,
    RolesModule,
    ColaboradoresModule,
    SubTaskModule,
    NodemailerModule,
    TemplateModule,
    SendEmailModule,
    CleanUpModule,
    NotificacionesModule
    
  ],
  controllers: [],
  providers: [CleanupService, NotificationsGateway],
})

export class AppModule {
  
}
