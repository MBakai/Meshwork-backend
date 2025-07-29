import { Entity, PrimaryGeneratedColumn, Column, Unique, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate, OneToMany, ManyToMany, JoinTable } from 'typeorm';

import { Task } from 'src/tasks/entities/task.entity';
import { Genero } from 'src/genero/entities/genero.entitys';
import { Roles } from 'src/roles/entities/roles.entity';
import { Colaborador } from 'src/colaboradores/entities/colaborador.entity';
import { Subtask } from 'src/sub-task/entities/sub-task.entity';
import { SendEmail } from 'src/send-email/entities/send-email.entity';
import { Exclude } from 'class-transformer';
import { Notificacione } from 'src/notificaciones/entities/notificacione.entity';

@Entity('user')
export class User {
    
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  nombre: string; 

  @Column('text')
  email: string;
  
  @Column('text',{
    select: false
  })
  password: string;

  @Column('bool',{
    default: false
  })
  @Exclude()
  activo: boolean;

  @Column({ nullable: true, select: false })
  @Exclude()
  refresh_token?: string; 

  @ManyToOne(
    () => Genero,
    genero  => genero.users)
  @JoinColumn({ name: 'id_genero' })
  genero: Genero;

  @ManyToOne(
    () => Roles,
    role => role.users,
    { eager: true }
  )
  @JoinColumn({ name: 'role_id' }) 
  role: Roles;

  // Tareas creadas por el usuario  
  @OneToMany(
    () => Task,
    (task) => task.creador)
  crearTasks: Task[];

  @ManyToMany(
    () => Subtask,
    subtask => subtask.asignados
  )
  subtasksAsignadas: Subtask[];

  @OneToMany(
    () => Colaborador,
     (amistad) => amistad.solicitante)
  sentCollabRequests: Colaborador[];

  @OneToMany(
    () => Colaborador,
     (amistad) => amistad.destinatario)
  receivedCollabRequests: Colaborador[];

  @OneToMany(() => Notificacione, noti => noti.usuario)
  notificaciones: Notificacione[];

  @OneToMany(() => SendEmail, verification => verification.user)
  verifications: SendEmail[];

  @BeforeInsert()
  CheckFieldBeforeInsert(){
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  CheckFieldBeforeUpdate(){
    this.CheckFieldBeforeInsert();
  }

}