import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PasswordRecoveryEmailData, SendEmailService, VerificationEmailData } from '../template/send-email.service';

@Injectable()
export class NodemailerService {

    private readonly transporter;
    
    constructor(
      private readonly emailTemplatesService: SendEmailService,
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER, // tu-email@gmail.com
                    pass: process.env.GMAIL_APP_PASSWORD, // App password de 16 caracteres
                },
        });
    }

    async sendVerificationEmail(to: string, name: string, verificationUrl: string) {
      const templateData: VerificationEmailData = {
      name,
      verificationUrl,
    };
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject: this.emailTemplatesService.getVerificationEmailSubject(),
      html: this.emailTemplatesService.getVerificationEmailTemplate(templateData),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error enviando email:', error);
      throw new Error('Error al enviar email de verificación');
    }
  }

  async sendPasswordRecoveryEmail(to: string, name: string, resetUrl: string) {
    const templateData: PasswordRecoveryEmailData = {
      name,
      resetUrl,
    };

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject: this.emailTemplatesService.getPasswordRecoveryEmailSubject(),
      html: this.emailTemplatesService.getPasswordRecoveryEmailTemplate(templateData),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de recuperación enviado:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error enviando email de recuperación:', error);
      throw new Error('Error al enviar email de recuperación de contraseña');
    }
  }

}
