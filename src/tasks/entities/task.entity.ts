import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Estados } from '../../estados/entities/estados.entity';
import { User } from "src/auth/entities/user.entity";
import { Subtask } from "src/sub-task/entities/sub-task.entity";
import { TaskType } from "./tipoTask.enum";
import { IsEnum } from "class-validator";

@Entity()
export class Task { 

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    titulo: string;

    @Column()
    descripcion: string;

    @IsEnum(TaskType)
    @Column({ 
        type: 'enum', 
        enum: TaskType,
        default: TaskType.SIMPLE, })
    type: TaskType;

    @ManyToOne( 
        () => Estados,
        ( estados ) => estados.tasks)
    @JoinColumn({ name: 'id_estado' })
    estados: Estados;

    // Relación con el creador de la tarea
    @ManyToOne(() => User)
    @JoinColumn({ name: 'creador_id' })
    creador: User;

    @OneToMany(
        () => Subtask,
         subtask => subtask.task,{
        cascade: ['remove'],    // Permite que al eliminar la Task, se eliminen las SubTasks
        onDelete: 'CASCADE'
    })
    subtasks: Subtask[];

    @CreateDateColumn({ type: 'timestamp without time zone' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp without time zone' })
    updatedAt: Date;

    @Column({type: 'date', nullable: true })
    startDate: string;

    @Column({type: 'date', nullable: true })
    endDate: string;

    @Column({ type: 'timestamp without time zone', nullable: true })
    completedAt: Date | null;

}
