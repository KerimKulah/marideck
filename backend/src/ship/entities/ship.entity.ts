import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity()
export class Ship {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    imoNumber: string; 

    @Column()
    name: string; 

    @Column({ nullable: true })
    type?: string;

    @Column({ nullable: true })
    flag?: string;

    @Column({ nullable: true })
    previousPort?: string;

    @Column({ nullable: true })
    operationPort?: string;

    @Column({ nullable: true })
    nextPort?: string;

    @Column({ nullable: true })
    status?: string;

    @Column({ type: 'timestamptz', nullable: true })
    eta?: Date;

    @Column({ type: 'timestamptz', nullable: true })
    etd?: Date;

    @Column({ nullable: true })
    shipOwner?: string;

    @Column({ nullable: true })
    agent?: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt?: Date;
}
