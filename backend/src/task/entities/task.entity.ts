import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { TaskStatus } from "../enums/task-status.enum";
import { TaskPriority } from "../enums/task-priority.enum";

@Entity()
export class Task {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string;

    @Column({ nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.PENDING
    })
    status: TaskStatus;

    @Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM
    })
    priority: TaskPriority;

    @Column({ type: 'timestamptz', nullable: true })
    dueDate?: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;
}

