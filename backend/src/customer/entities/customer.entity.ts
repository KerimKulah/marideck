import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from "typeorm";
import { Operation } from "../../operation/entities/operation.entity";


@Entity()
export class Customer {

    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    name: string;

    @Index()
    @Column({ nullable: true })
    company?: string;

    @Index()
    @Column({ unique: true })
    email: string;

    @Index()
    @Column()
    phone: string;

    @Index()
    @Column({ nullable: true })
    taxNumber?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ nullable: true })
    country?: string;

    @Column({ type: 'timestamptz', nullable: true })
    lastTransactionDate?: Date;

    @Column({ nullable: true })
    customerType?: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;

    @OneToMany(() => Operation, operation => operation.customer)
    operations: Operation[];

}
