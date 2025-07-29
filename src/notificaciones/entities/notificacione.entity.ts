import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TypeNotification } from "./type-notification.enum";
import { IsEnum } from "class-validator";
import { User } from "src/auth/entities/user.entity";

@Entity()
export class Notificacione {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'text', nullable: true})
    titulo: string;

    @ManyToOne(() => User, user => user.notificaciones, { onDelete: 'CASCADE' })
    usuario: User;

    @IsEnum(TypeNotification)
    @Column({type: 'enum', 
            enum: TypeNotification,
            default: TypeNotification.NONE,})
    tipo: TypeNotification;

    @Column()
    mensaje: string;

    @Column({type: 'bool', default: false })
    leida: boolean;

    @Column({type: 'bool', default: false, nullable: true})
    procesada: boolean;

    @Column({ type: 'jsonb', nullable: true })
    data: any;

    @CreateDateColumn()
    createdAt: Date;

}
