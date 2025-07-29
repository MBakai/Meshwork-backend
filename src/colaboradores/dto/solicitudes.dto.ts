import { ColaboradorDto } from "./colaborador.dto";

export class SolicitudDTO {
  id: string;
  status: string;
  createdAt: Date;
  updateAt: Date;
  solicitante: ColaboradorDto;
  destinatario: ColaboradorDto;
}