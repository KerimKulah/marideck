import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne, Column, JoinColumn, DeleteDateColumn } from "typeorm";
import { User } from "src/auth/user/entities/user.entity";
import { Operation } from "src/operation/entities/operation.entity";

@Entity()
export class OperationLog {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @ManyToOne(() => Operation, (operation) => operation.operationLogs)
    operation: Operation;

    @ManyToOne(() => User)
    createdBy: User;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;
}
