import { User } from "src/auth/user/entities/user.entity";
import { Customer } from "src/customer/entities/customer.entity";
import { OperationLog } from "src/operation-log/entities/operation-log.entity";
import { Ship } from "src/ship/entities/ship.entity";
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, OneToMany, JoinTable } from "typeorm";
import { OperationStatus } from "../enums/operation-status.enum";

@Entity()
export class Operation {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string;

    @Column()
    type: string;

    @Column()
    details: string;

    @Column()
    port: string;

    @ManyToOne(() => Customer, { onDelete: 'RESTRICT' })
    customer: Customer;

    @ManyToMany(() => User)
    @JoinTable()
    users: User[];

    @ManyToOne(() => Ship, { onDelete: 'RESTRICT' })
    ship: Ship;

    @OneToMany(() => OperationLog, (operationLog) => operationLog.operation)
    operationLogs: OperationLog[];

    @Column({ type: 'timestamptz' })
    startDate: Date;

    @Column({ type: 'timestamptz' })
    endDate: Date;

    @Column({
        type: 'enum',
        enum: OperationStatus,
        default: OperationStatus.PLANNED
    })
    status: OperationStatus;

    @Column({ nullable: true })
    cargoType?: string;

    @Column({ nullable: true })
    cargoDetails?: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    finishedAt?: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;
}
