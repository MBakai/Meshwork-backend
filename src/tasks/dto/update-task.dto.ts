import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { TaskType } from '../entities/tipoTask.enum';
import { Type } from 'class-transformer';
import { CreateSubTaskDto } from 'src/sub-task/dto/create-sub-task.dto';

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
