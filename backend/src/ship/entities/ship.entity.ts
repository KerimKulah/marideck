import { Customer } from "src/customer/entities/customer.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, } from "typeorm";

@Entity()
export class Ship {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true, unique: true })
    imoNumber?: string;

    @Column({ nullable: true, unique: true })
    mmsiNumber?: string;

    @Column({ nullable: true, unique: true })
    callsign?: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    type?: string;

    @Column({ nullable: true })
    flag?: string;

    @Column({ nullable: true, type: 'timestamptz' })
    eta?: Date; // Tahmini varış zamanı

    @Column({ nullable: true, type: 'timestamptz' })
    etd?: Date; // Tahmini kalkış zamanı (Eğer veri varsa)

    @Column({ nullable: true })
    status?: string; // Durum (active, berthed vb.)

    @Column({ nullable: true, type: 'text' })
    notes?: string; // Notlar 

    @Column({ nullable: true })
    departurePort?: string; // Kalkış liman

    @Column({ nullable: true })
    destinationPort?: string; // Varış liman

    @Column({ nullable: true, type: 'int' })
    builtYear?: number; // İnşa yılı

    @Column({ nullable: true, type: 'float' })
    grossTonnage?: number; // Brüt tonaj (GT)

    @Column({ nullable: true, type: 'float' })
    deadweight?: number; // Deadweight tonaj (DWT) 

    @Column({ nullable: true, type: 'float' })
    draft?: number; // Draft (su çekimi)

    @Column({ nullable: true, type: 'float' })
    length?: number; // Uzunluk (metre) 

    @Column({ nullable: true, type: 'float' })
    beam?: number; // Genişlik (metre)

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt?: Date;
}
