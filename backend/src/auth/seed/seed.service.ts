import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/auth/role/entities/role.entity';
import { User } from 'src/auth/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        await this.seedRoles();
        await this.seedAdminUser();
    }

    // ADMIN VE USER ROLU OLUŞTURMA
    private async seedRoles() {
        const roles = ['admin', 'employee'];

        for (const roleName of roles) {
            const exists = await this.roleRepository.findOne({ where: { name: roleName } });
            if (!exists) {
                const role = this.roleRepository.create({ name: roleName });
                await this.roleRepository.save(role);
            }
        }
    }

    // ADMIN KULLANICI OLUŞTURMA
    private async seedAdminUser() {
        const adminEmail = 'admin@example.com';
        const exists = await this.userRepository.findOne({
            where: { email: adminEmail },
            relations: ['roles']
        });

        if (!exists) {
            const adminRole = await this.roleRepository.findOne({
                where: { name: 'admin' }
            });

            if (!adminRole) {
                throw new Error('Admin role not found. Please seed roles first.');
            }

            const user = this.userRepository.create({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                password: await bcrypt.hash('admin123', 10),
                roles: [adminRole],
                phone: '1234567890',
            });

            await this.userRepository.save(user);
            console.log('🟢 Admin user created with email: admin@example.com, password: admin123');
        }
    }
}
