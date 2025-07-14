import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from "typeorm";
import { Ship } from "src/ship/entities/ship.entity";

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

    @OneToMany(() => Ship, (ship) => ship.customer, { nullable: true, onDelete: 'SET NULL' })
    ship?: Ship[];

    @Column({ type: 'timestamptz', nullable: true })
    lastTransactionDate?: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt?: Date;
}


/*
🔄 Opsiyonel ama iyi uygulamalar:
onDelete: 'SET NULL' eklemek → müşteri silinirse gemi kayıtları bozulmasın.
nullable: true → geminin şu anda bir müşteriye bağlı olmayabileceğini destekler.
eager: true/false → ihtiyaç varsa gemiyi çekerken müşteriyi (veya tam tersi) otomatik getirip getirmeyeceğini ayarlarsın.
*/