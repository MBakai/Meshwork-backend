import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  
  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false, //this.configService.get('NODE_ENV') === 'production'  
      sameSite: 'lax',             // <-- permite enviar cookie entre puertos/localhosts
      path: '/', 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });
  }

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',             // <-- permite enviar cookie entre puertos/localhosts
      path: '/', 
    });
  }

  //PARA PRODUCCION HABILITAR ESTO

//   setRefreshTokenCookie(res: Response, refreshToken: string) {
//   res.cookie('refresh_token', refreshToken, {
//     httpOnly: true,
//     secure: this.configService.get('COOKIE_SECURE') === 'true', // true en producción (HTTPS)
//     sameSite: this.configService.get('COOKIE_SAMESITE') as 'lax' | 'strict' | 'none',
//     domain: this.configService.get('COOKIE_DOMAIN'), // Dominio en producción
//     path: '/',
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
//   });
// }

  // clearRefreshTokenCookie(res: Response) {
  //   res.clearCookie('refresh_token', {
  //     httpOnly: true,
  //     secure: this.configService.get('COOKIE_SECURE') === 'true', // true en producción (HTTPS)
  //     sameSite: this.configService.get('COOKIE_SAMESITE') as 'lax' | 'strict' | 'none',
  //     domain: this.configService.get('COOKIE_DOMAIN'), // Dominio en producción            // <-- permite enviar cookie entre puertos/localhosts
  //     path: '/', 
  //   });
  // }

  

  signAccessToken(payload: any): Promise<string> {

    const enhancedPayload = {
      ...payload,
      jti: randomUUID(), 
    };
    
    return this.jwtService.signAsync(enhancedPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
  }

  signRefreshToken(payload: any): Promise<string> {

    const enhancedPayload = {
      ...payload,
      jti: randomUUID(), 
    };

    return this.jwtService.signAsync(enhancedPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }

  verifyAccessToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  verifyRefreshToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }
}
