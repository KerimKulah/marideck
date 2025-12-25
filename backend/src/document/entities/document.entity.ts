import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from 'src/auth/user/entities/user.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Ship } from 'src/ship/entities/ship.entity';
import { Operation } from 'src/operation/entities/operation.entity';
import { DocumentType } from '../enums/document-type.enum';
import { DocumentStatus } from '../enums/document-status.enum';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  type: DocumentType;

  @Column({ nullable: true })
  documentNumber?: string;

  @Column()
  fileUrl: string; // R2'den gelen URL

  @Column()
  fileName: string;

  @Column()
  fileSize: number; // bytes

  @Column()
  mimeType: string;

  // Task'taki gibi isteğe bağlı ilişkilendirmeler
  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  customer?: Customer;

  @ManyToOne(() => Ship, { nullable: true, onDelete: 'SET NULL' })
  ship?: Ship;

  @ManyToOne(() => Operation, { nullable: true, onDelete: 'SET NULL' })
  operation?: Operation;

  @Column({ type: 'date', nullable: true })
  issueDate?: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User, { nullable: false })
  uploadedBy: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}

