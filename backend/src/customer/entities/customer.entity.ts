import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from "typeorm";


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
    customer_type?: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt?: Date;
}

