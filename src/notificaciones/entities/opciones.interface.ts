import { User } from "src/auth/entities/user.entity";
import { TypeNotification } from "./type-notification.enum";

export interface Opciones{
    titulo: string;
        tipo: TypeNotification;
        para: User; // userId
        mensaje: string;
        leida: boolean;
        procesada: boolean;
        data?: any;
}