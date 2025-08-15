import { User } from "src/auth/entities/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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
