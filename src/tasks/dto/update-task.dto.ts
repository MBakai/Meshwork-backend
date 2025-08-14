import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskType } from '../entities/tipoTask.enum';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {

    @IsOptional()
    @IsString()
    @MaxLength(50)
    titulo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    descripcion?: string;

    @IsOptional()
    @IsEnum(TaskType)
    type?: TaskType;

}
