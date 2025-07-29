import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateColaboradorDto {
  
  @IsUUID()
  destinatarioId: string;

}