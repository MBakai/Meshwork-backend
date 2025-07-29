import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificacioneDto } from './create-notificacione.dto';
import { IsBoolean } from 'class-validator';

export class UpdateNotificacioneDto extends PartialType(CreateNotificacioneDto) {

    @IsBoolean()
    leida: boolean;


}
