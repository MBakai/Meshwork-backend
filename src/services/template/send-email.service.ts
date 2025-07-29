import { Injectable } from '@nestjs/common';


export interface VerificationEmailData {
  name: string;
  verificationUrl: string;
}

export interface PasswordRecoveryEmailData {
  name: string;
  resetUrl: string;
}

@Injectable()
export class SendEmailService {

    getVerificationEmailTemplate(data: VerificationEmailData): string {
    const { name, verificationUrl } = data;
    
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido!</h1>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hola ${name},</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Gracias por registrarte en nuestra plataforma. Para completar tu registro, necesitas verificar tu dirección de correo electrónico.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: black; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Verificar mi cuenta
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Este enlace expirará en 24 horas. Si no verificas tu cuenta en este tiempo, será eliminada automáticamente.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Si no te registraste en nuestro sitio, puedes ignorar este correo de forma segura.
          </p>
        </div>
      </div>
    `;
  }

  // Método adicional para obtener el subject del email
  getVerificationEmailSubject(): string {
    return 'Verifica tu cuenta';
  }

  // Puedes agregar más templates aquí
  getPasswordRecoveryEmailTemplate(data: PasswordRecoveryEmailData): string {
    const { name, resetUrl } = data;
    
    return `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Recuperar Contraseña</h1>
        </div>
        
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hola ${name},</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú quien hizo esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
              style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                      color: Black; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);">
              Restablecer mi contraseña
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Este enlace expirará en 1 hora por motivos de seguridad. Si necesitas un nuevo enlace, solicita otro restablecimiento de contraseña.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; font-size: 14px; margin: 0; text-align: center;">
              <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo válida.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Por tu seguridad, nunca compartas este enlace con nadie. Si tienes problemas, contacta con nuestro soporte.
          </p>
        </div>
      </div>
    `;
  }

  getPasswordRecoveryEmailSubject(): string {
    return 'Recuperación de Contraseña - Acción Requerida';
  }

  getWelcomeEmailTemplate(data: { name: string }): string {
    // Template de bienvenida
    return `<!-- Template de bienvenida -->`;
  }

}
