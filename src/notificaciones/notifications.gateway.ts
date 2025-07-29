import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credential: true,
  },
})

export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  // Mapear userId con su socketId
  private usuariosConectados = new Map<string, string>();

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      this.usuariosConectados.set(userId, socket.id);
      console.log(`Usuario ${userId} conectado con socketId ${socket.id}`);
    }
  }

  handleDisconnect(socket: Socket) {
    for (const [userId, id] of this.usuariosConectados.entries()) {
      if (id === socket.id) {
        this.usuariosConectados.delete(userId);
        console.log(`Usuario ${userId} desconectado`);
        break;
      }
    }
  }

  emitirNotificacionAlUsuario(userId: User, notificacion: any) {
    const socketId = this.usuariosConectados.get(userId.id);
    if (socketId) {
      this.server.to(socketId).emit('notificacion', notificacion);
    } else {
      console.log(`⚠️ Usuario ${userId} no conectado al WebSocket`);
    }
  }

}