import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { TaskStatus } from "../enums/task-status.enum";
import { TaskPriority } from "../enums/task-priority.enum";
import { User } from "src/auth/user/entities/user.entity";
import { Customer } from "src/customer/entities/customer.entity";
import { Ship } from "src/ship/entities/ship.entity";
import { Operation } from "src/operation/entities/operation.entity";

@Entity()
export class Task {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
    status: TaskStatus;

    @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
    priority: TaskPriority;

    @Column({ type: 'timestamptz', nullable: true })
    dueDate?: Date;

    @ManyToMany(() => User)
    @JoinTable()
    assignedTo: User[];

    @ManyToOne(() => User, { nullable: false, onDelete: 'SET NULL' })
    createdBy?: User;

    @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
    customer?: Customer;

    @ManyToOne(() => Ship, { nullable: true, onDelete: 'SET NULL' })
    ship?: Ship;

    @ManyToOne(() => Operation, { nullable: true, onDelete: 'SET NULL' })
    operation?: Operation;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;
}

