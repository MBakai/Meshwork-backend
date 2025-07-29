import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe, Query, Req } from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('colaboradores')
export class ColaboradoresController {
  constructor(private readonly colaboradoresService: ColaboradoresService) {}

  @Post('enviar')
  @Auth('admin','usuario')
  async enviar(
    @GetUser() user: User, 
    @Body('destinatarioId', ParseUUIDPipe) destinatarioId: string,
  ) {
    return this.colaboradoresService.enviarSolicitud(user.id, destinatarioId);
  }

  @Auth('admin','usuario')
  @Patch('aceptar/:id')
  async aceptarSolicitud(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User){
    return this.colaboradoresService.aceptarSolicitud(id, user);
  }
 

  @Auth('admin','usuario')
  @Get('pendientes')
  async verSolicitudesPendientes(@GetUser() user: User) {
    return this.colaboradoresService.obtenerSolicitudesPendientes(user.id);
  }

  
@Auth('admin','usuario')
@Patch('rechazar/:id')
  async rechazarSolicitud(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User
  ) {
    return this.colaboradoresService.rechazarSolicitud(id, user);
  }


  @Get('get-colaborador')
  @Auth('admin','usuario')
  listarColaboradores(@GetUser() user: User){
    return this.colaboradoresService.getColaboradores(user)
  }

  @Get('search-user')
  @Auth('admin', 'usuario') // o el decorador que uses para proteger rutas
  buscarUsuarios(@Query('email') email: string, @GetUser() user: User) {
    return this.colaboradoresService.buscarColaboradorEmail(email, user.id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.colaboradoresService.remove(+id);
  // }
}
