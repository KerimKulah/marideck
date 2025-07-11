import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from "typeorm";

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
    @Column({ nullable: true })
    phone?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ nullable: true })
    country?: string;

    @Column({ type: 'timestamptz', nullable: true })
    lastTransactionDate?: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt?: Date;
}
 