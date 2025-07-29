import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeneroModule } from 'src/genero/genero.module';
import { Colaborador } from 'src/colaboradores/entities/colaborador.entity';
import { Roles } from 'src/roles/entities/roles.entity';
import { JwtStrategy } from './strategy/jwt-strategy';
import { Subtask } from 'src/sub-task/entities/sub-task.entity';
import { SendEmail } from 'src/send-email/entities/send-email.entity';
import { NodemailerModule } from 'src/services/nodemailer/nodemailer.module';
import { JwtTokenService } from './jwt-token-service/jwt-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User, Roles, Colaborador, Subtask, SendEmail]),
    
    PassportModule.register({defaultStrategy: 'jwt'}),
    GeneroModule, Roles, Colaborador,
    NodemailerModule, JwtModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtTokenService],
  exports: [AuthService, JwtStrategy, PassportModule, JwtTokenService],
})
export class AuthModule {}
