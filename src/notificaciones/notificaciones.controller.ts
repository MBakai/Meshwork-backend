import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Auth('admin','usuario')
  @Get('mis-notificaciones')
  async obtenerNotificaciones(@GetUser() user: User) {
    return this.notificacionesService.obtenerPorUsuario(user.id);
  }

  @Auth('admin','usuario')
  @Patch('todas-leidas')
  async marcarComoLeida(@GetUser() user: User) {
    return this.notificacionesService.marcarTodasComoLeidas( user.id );
  }

  @Auth('admin', 'usuario')
  @Patch('leida/:id')
  async marcarNotificacionComoLeida(@GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string) {
    return this.notificacionesService.marcarComoLeida(id, user.id );
  }

  @Auth('admin','usuario')
  @Get('contador')
  async obtenerContador(@GetUser() user: User) {
    return this.notificacionesService.contarNoLeidas(user.id);
     
  }

}
