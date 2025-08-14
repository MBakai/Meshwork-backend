import { IsArray, IsOptional, IsUUID } from "class-validator";

export class UpdateEstadoSubTaskDto {

    
    @IsOptional()
    id_estado?: number; 
  
    @IsOptional()
    @IsArray()
    @IsUUID("all", { each: true })
    asignados?: string[]; // lista de IDs de usuarios asignados


}