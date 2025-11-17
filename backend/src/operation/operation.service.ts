import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operation } from './entities/operation.entity';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { OperationDto } from './dto/operation.dto';
import { Customer } from '../customer/entities/customer.entity';
import { Ship } from '../ship/entities/ship.entity';
import { User } from '../auth/user/entities/user.entity';

@Injectable()
export class OperationService {

    constructor(@InjectRepository(Operation) private operationRepository: Repository<Operation>) { }

    async findAll(page?: number, limit?: number, search?: string, tab?: 'my-operations-active' | 'my-operations-completed' | 'all-active' | 'all-completed', userId?: number) {
        const queryBuilder = this.operationRepository.createQueryBuilder('operation')
            .withDeleted() // Customer ve Ship  soft delete olsa bile verileri getirsin
            .leftJoinAndSelect('operation.customer', 'customer')
            .leftJoinAndSelect('operation.ship', 'ship')
            .leftJoinAndSelect('operation.users', 'user')
            .leftJoinAndSelect('operation.operationLogs', 'operationLog')
            .leftJoin('operationLog.createdBy', 'createdBy').addSelect(['createdBy.firstName', 'createdBy.lastName', 'createdBy.email']);

        // Tab filtreleme
        if (tab === 'my-operations-active') {
            // Kullanıcıya atanmış aktif operasyonlar (planned, in_progress)
            if (userId) {
                queryBuilder.andWhere('user.id = :userId', { userId });
                queryBuilder.andWhere('operation.status IN (:...activeStatuses)', { activeStatuses: ['planned', 'in_progress'] });
            } else {
                queryBuilder.andWhere('1 = 0');
            }
        } else if (tab === 'my-operations-completed') {
            // Kullanıcıya atanmış tamamlanmış operasyonlar
            if (userId) {
                queryBuilder.andWhere('user.id = :userId', { userId });
                queryBuilder.andWhere('operation.status = :status', { status: 'completed' });
            } else {
                queryBuilder.andWhere('1 = 0');
            }
        } else if (tab === 'all-active') {
            // Tüm aktif operasyonlar (planned, in_progress)
            queryBuilder.andWhere('operation.status IN (:...activeStatuses)', { activeStatuses: ['planned', 'in_progress'] });
        } else if (tab === 'all-completed') {
            // Tüm tamamlanmış operasyonlar
            queryBuilder.andWhere('operation.status = :status', { status: 'completed' });
        }
        // Eğer tab belirtilmemişse, tüm operasyonlar (geriye dönük uyumluluk için)

        if (search && search.trim() !== '') {
            queryBuilder.andWhere(
                new Brackets((qb: WhereExpressionBuilder) => {
                    qb.where('operation.name ILIKE :search', { search: `%${search}%` })
                        .orWhere('operation.type ILIKE :search', { search: `%${search}%` })
                        .orWhere('operation.details ILIKE :search', { search: `%${search}%` })
                        .orWhere('operation.port ILIKE :search', { search: `%${search}%` })
                        .orWhere('customer.name ILIKE :search', { search: `%${search}%` })
                        .orWhere('ship.name ILIKE :search', { search: `%${search}%` });
                }),
            );
        }

        queryBuilder.orderBy('operation.createdAt', 'DESC');

        if (page != null && limit != null) {
            queryBuilder.skip((page - 1) * limit).take(limit);
        }

        const [operations, operationsCount] = await queryBuilder.getManyAndCount();

        const result: { operations: Operation[], operationsCount: number, page?: number, limit?: number, totalPages?: number } = {
            operations,
            operationsCount,
        };

        if (page != null && limit != null) {
            result.page = page;
            result.limit = limit;
            result.totalPages = Math.ceil(operationsCount / limit);
        }

        return result;
    }

    async findOne(id: number): Promise<Operation> {
        const operation = await this.operationRepository.findOne({
            where: { id },
            relations: ['operationLogs', 'operationLogs.createdBy', 'customer', 'ship', 'users'],
            withDeleted: true // Customer ve Ship için soft delete olsa bile verileri getirsin
        });
        if (!operation) throw new NotFoundException('Operation not found');
        return operation;
    }

    async create(operationDto: OperationDto) {
        const operation = new Operation();

        // Map DTO to entity
        operation.name = operationDto.name;
        operation.type = operationDto.type;
        operation.details = operationDto.details;
        operation.port = operationDto.port;
        operation.startDate = operationDto.startDate;
        operation.endDate = operationDto.endDate;
        operation.status = operationDto.status;
        operation.cargoType = operationDto.cargoType;
        operation.cargoDetails = operationDto.cargoDetails;
        operation.finishedAt = operationDto.finishedAt;

        // Set relationships
        operation.customer = { id: operationDto.customerId } as Customer;
        operation.ship = { id: operationDto.shipId } as Ship;

        // Set users relationship if provided
        if (operationDto.userId && operationDto.userId.length > 0) {
            operation.users = operationDto.userId.map(userId => ({
                id: userId
            } as User));
        }

        try {
            const savedOperation = await this.operationRepository.save(operation);
            return { message: 'Operation created successfully', data: await this.findOne(savedOperation.id) };
        } catch (error) {
            throw new Error(`Failed to create operation: ${error.message}`);
        }
    }

    async update(id: number, operationDto: OperationDto): Promise<{ message: string, data: Operation }> {
        const operation = await this.findOne(id);
        const { customerId, shipId, userId, ...rest } = operationDto;

        // Daha güvenli update
        for (const [key, value] of Object.entries(rest)) {
            if (value !== undefined) {
                operation[key] = value;
            }
        }

        if (customerId !== undefined) {
            operation.customer = { id: customerId } as Customer;
        }

        if (shipId !== undefined) {
            operation.ship = { id: shipId } as Ship;
        }

        if (userId !== undefined) {
            operation.users = userId.map(id => ({ id } as User));
        }

        const updated = await this.operationRepository.save(operation);
        return { message: 'Operation updated successfully', data: updated };
    }

    async remove(id: number): Promise<{ message: string }> {
        await this.operationRepository.softDelete(id);
        return { message: 'Operation soft deleted successfully' };
    }

    async restore(id: number): Promise<{ message: string }> {
        await this.operationRepository.restore(id);
        return { message: 'Operation restored successfully' };
    }

    async getStatistics(userId?: number) {
        // Kullanıcıya atanmış aktif operasyonlar (PLANNED ve IN_PROGRESS)
        let myOperationsActiveCount = 0;
        if (userId) {
            const myOperationsActiveQuery = this.operationRepository.createQueryBuilder('operation')
                .leftJoin('operation.users', 'user')
                .where('user.id = :userId', { userId })
                .andWhere('operation.status IN (:...statuses)', { statuses: ['planned', 'in_progress'] });
            myOperationsActiveCount = await myOperationsActiveQuery.getCount();
        }

        // Kullanıcıya atanmış tamamlanmış operasyonlar
        let myOperationsCompletedCount = 0;
        if (userId) {
            const myOperationsCompletedQuery = this.operationRepository.createQueryBuilder('operation')
                .leftJoin('operation.users', 'user')
                .where('user.id = :userId', { userId })
                .andWhere('operation.status = :status', { status: 'completed' });
            myOperationsCompletedCount = await myOperationsCompletedQuery.getCount();
        }

        // Tüm aktif operasyonlar (PLANNED ve IN_PROGRESS)
        const activeOperationsQuery = this.operationRepository.createQueryBuilder('operation')
            .where('operation.status IN (:...statuses)', { statuses: ['planned', 'in_progress'] });
        const activeOperationsCount = await activeOperationsQuery.getCount();

        // Tüm tamamlanan operasyonlar
        const completedOperationsQuery = this.operationRepository.createQueryBuilder('operation')
            .where('operation.status = :status', { status: 'completed' });
        const completedOperationsCount = await completedOperationsQuery.getCount();

        return {
            myOperations: myOperationsActiveCount, // Geriye dönük uyumluluk için
            myOperationsActive: myOperationsActiveCount,
            myOperationsCompleted: myOperationsCompletedCount,
            activeOperations: activeOperationsCount,
            completedOperations: completedOperationsCount,
        };
    }
}
