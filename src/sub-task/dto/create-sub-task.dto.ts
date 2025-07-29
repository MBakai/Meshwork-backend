import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { Task } from '../../tasks/entities/task.entity';

export class CreateSubTaskDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50, { message: 'El título no debe exceder 50 caracteres' })
    titulo: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(500, { message: 'La descripción no debe exceder 500 caracteres' })
    descripcion: string;
      
    @IsArray()
    @IsUUID(4, { each: true })
    @IsOptional()
    asignados?: string[];

    @IsDateString()
    startDate?: string;

    @IsDateString()
    endDate: string;

    @IsDateString()
    @IsOptional()
    createdAt: Date;

    
    
      
}
