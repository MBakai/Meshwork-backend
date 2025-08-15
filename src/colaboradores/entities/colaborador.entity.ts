
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Colaborador {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
         user => user.sentCollabRequests,
        { onDelete: 'CASCADE' })
    solicitante: User; // El que envía la solicitud

    @ManyToOne(() => User,
     user => user.receivedCollabRequests,
      { onDelete: 'CASCADE' })
    destinatario: User; // El que recibe la solicitud

    @Column({ default: 'pendiente' })
    status: 'pendiente' | 'aceptada' | 'rechazada';

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
