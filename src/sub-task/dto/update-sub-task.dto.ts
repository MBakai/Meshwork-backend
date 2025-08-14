import { PartialType } from '@nestjs/mapped-types';
import { CreateSubTaskDto } from './create-sub-task.dto';
import { IsArray, IsDate, IsDateString, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSubTaskDto extends PartialType(CreateSubTaskDto) {

    
    @IsOptional()
    id_estado?: number; 
  
    @IsOptional()
    @IsArray()
    @IsUUID("all", { each: true })
    asignados?: string[]; // lista de IDs de usuarios asignados

    @IsOptional()
    @IsArray()
    @IsUUID("all", { each: true })
    quitarAsignados?: string[];
  
    @IsDateString()
    @IsOptional()
    completedAt?: Date;
}
