import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../auth/entities/user.entity';

@Entity()
export class SendEmail {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    token: string;

    @Column('timestamp')
    expiresAt: Date;

    @Column('text')
        type: 'EMAIL' | 'PASSWORD_RESET';

    @Column({ default: false })
    used: boolean;

    @ManyToOne(() => User, user => user.verifications, { onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

}
