
import { IsNotEmpty, IsString, MinLength, IsOptional, IsDateString, IsEnum, MaxLength } from 'class-validator';
import { TaskType } from '../entities/tipoTask.enum';

  export class CreateTaskDto {

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

    @IsEnum(TaskType)
    type: TaskType;
  
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate: string;

    @IsDateString()
    @IsOptional()
    createdAt: Date;


  }