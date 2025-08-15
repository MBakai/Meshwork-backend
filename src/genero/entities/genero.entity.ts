

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../auth/entities/user.entity';

@Entity('genero')
export class Genero{

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    nombre: string;

    @OneToMany( 
        () => User,
        user  => user.genero)
    users: User[];
}
