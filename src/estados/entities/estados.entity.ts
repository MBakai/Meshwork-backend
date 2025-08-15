import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "../../tasks/entities/task.entity";
import { Subtask } from "../../sub-task/entities/sub-task.entity"

@Entity()
export class Estados{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @OneToMany( () => Task,
        ( task ) => task.estados)
    tasks: Task[];
    
    @OneToMany(() => Subtask,
        (subtask) => subtask.estados)
    subtasks: Subtask[]
}