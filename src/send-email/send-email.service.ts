import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { SendEmail } from './entities/send-email.entity';
import { NodemailerService } from 'src/services/nodemailer/nodemailer.service';
import { Repository, LessThan } from 'typeorm';

@Injectable()
export class SendEmailService {
  
  constructor(
    @InjectRepository(User) 
    private readonly usuarioRepository: Repository<User>,
    @InjectRepository(SendEmail) 
      private readonly userVerificationRepository: Repository<SendEmail>,
  ) {}

  // **************************************************************************
  // ******* Cunado el usuario revise su correo y verifique con el link                                        *
  // * ************************************************************************
  async verifyAccount(token: string): Promise<{ message: string }> {

    const userVerification  = await this.userVerificationRepository.findOne({
      where: { 
        token,
        type:'EMAIL',
        used: false
        },
        relations: ['user'],
    });

    if (!userVerification) {
      throw new BadRequestException('Token de verificación inválido');
    }

    const user = userVerification.user;

    if (!userVerification.expiresAt || userVerification.expiresAt < new Date()) {
    // Token expirado → eliminar token y usuario
    await this.userVerificationRepository.remove(userVerification);
    await this.usuarioRepository.remove(user);
    throw new BadRequestException('Token expirado. Por favor regístrate nuevamente.');
  }

    // Marcar verificación como usada y verificar al usuario
    userVerification.used = true;
    await this.userVerificationRepository.save(userVerification);

    // Activar usuario
    user.activo = true;
    await this.usuarioRepository.save(user);

    return { message: 'Cuenta verificada exitosamente' };
  }

  async verifyEmailPassword(token: string): Promise<{ message: string }> {

    const userVerification  = await this.userVerificationRepository.findOne({
      where: { 
        token,
        type:'PASSWORD_RESET',
        used: false
       },
       relations: ['user'],
    });

    if (!userVerification) {
      throw new BadRequestException('Token de verificación inválido');
    }

    const user = userVerification.user;

    if (!userVerification.expiresAt || userVerification.expiresAt < new Date()) {
    // Token expirado → eliminar token y usuario
    await this.userVerificationRepository.remove(userVerification);
    throw new BadRequestException('Token expirado. Porfavor vulve a intentarlo.');
  }

    // Marcar verificación como usada y verificar al usuario
    userVerification.used = true;
    await this.userVerificationRepository.save(userVerification);

    return { message: 'Verificacion completada exitosamente' };

  }

  // Tarea programada para eliminar usuarios no verificados después de 24 horas
  async cleanupUnverifiedUsers(): Promise<void> {
    // Buscar tokens de verificación expirados y no usados (tipo EMAIL)
    const expiredVerifications = await this.userVerificationRepository.find({
      where: {
        type: 'EMAIL',
        used: false,
        expiresAt: LessThan(new Date()),
      },
      relations: ['user'],
    });

    if (expiredVerifications.length === 0) return;

    // Extraer los usuarios asociados a estos tokens expirados
    const usersToRemove = expiredVerifications.map(v => v.user);

    // Eliminar tokens y usuarios
    await this.userVerificationRepository.remove(expiredVerifications);
    await this.usuarioRepository.remove(usersToRemove);

    console.log(`Eliminados ${usersToRemove.length} usuarios no verificados`);
  }

   async cleanupUnverifiedPasswordResets(): Promise<void> {
    const expiredResets = await this.userVerificationRepository.find({
      where: {
        type: 'PASSWORD_RESET',
        used: false,
        expiresAt: LessThan(new Date()),
      }
    });

    if (!expiredResets.length) return;

    // Aquí NO borras usuarios
    await this.userVerificationRepository.remove(expiredResets);

    console.log(`Eliminadas ${expiredResets.length} solicitudes de recuperación expiradas`);
  }
}
