import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Estados } from '../../estados/entities/estados.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../auth/entities/user.entity';




@Entity('subTask')
export class Subtask {
  @PrimaryGeneratedColumn('uuid')
  id: string; 

  @Column()
  titulo: string;

  @Column({ nullable: true })
  descripcion: string;

  @ManyToOne(() => Estados)
  @JoinColumn({ name: 'id_estado' })
  estados: Estados;

  @ManyToOne(
    () => Task,
     task => task.subtasks,{
      onDelete: 'CASCADE'
  })   
  task: Task;

  @ManyToMany(() => User)
  @JoinTable({
      name: 'subtask_asignados',
      joinColumn: {
          name: 'subtask_id',
          referencedColumnName: 'id',
      },
      inverseJoinColumn: {
          name: 'user_id',
          referencedColumnName: 'id',
      },
  })
  asignados: User[];

  @Column({type: 'date', nullable: true })
  startDate: string;

  @Column({type: 'date', nullable: true })
  endDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp without time zone', nullable: true })
  completedAt: Date;
}