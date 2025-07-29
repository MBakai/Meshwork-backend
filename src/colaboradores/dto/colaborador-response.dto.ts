import { User } from "src/auth/entities/user.entity";

export class ColaboradorResponseDto {
  id: string;
  email: string;
  nombre: string;
  fueEnviadaPorMi: boolean;

  constructor(user: User, fueEnviadaPorMi: boolean) {
    this.id = user.id;
    this.email = user.email;
    this.nombre = user.nombre;
    this.fueEnviadaPorMi = fueEnviadaPorMi;
  }
}