import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

// Bu entity session yönetimi için kullanılır.
@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column(({ unique: true }))
    hash: string;  // Session token (refresh token)

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @Column({ nullable: true })
    deviceInfo: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ default: false })
    isRevoked: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    usedAt: Date;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
    user: User;
}
