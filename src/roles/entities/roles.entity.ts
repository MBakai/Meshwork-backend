import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../auth/entities/user.entity';

@Entity('roles')
export class Roles {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    rolNombre: string;

    @OneToMany(
        () => User,
        user => user.role
      )
      users: User[];
}
