import { ColaboradorDto } from "src/colaboradores/dto/colaborador.dto";
import { Task } from "../entities/task.entity";

export class ListaTaskFullDto {
  tarea: Task;
  colaboradores: ColaboradorDto[];
}