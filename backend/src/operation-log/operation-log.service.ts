import { InjectRepository } from "@nestjs/typeorm";
import { OperationLog } from "./entities/operation-log.entity";
import { Repository } from "typeorm";
import { OperationLogDto } from "./dto/operation-log.dto";
import { NotFoundException } from "@nestjs/common";
import { User } from "src/auth/user/entities/user.entity";
import { Operation } from "src/operation/entities/operation.entity";

export class OperationLogService {
    constructor(@InjectRepository(OperationLog) private readonly operationLogRepo: Repository<OperationLog>) { }

    async create(operationLogDto: OperationLogDto): Promise<{ message: string, data: OperationLog }> {
        const operationLog = new OperationLog();

        // Map DTO to entity
        operationLog.description = operationLogDto.description;

        // Set relationships
        operationLog.createdBy = { id: operationLogDto.createdById } as User;
        operationLog.operation = { id: operationLogDto.operationId } as Operation;

        try {
            const savedLog = await this.operationLogRepo.save(operationLog);
            return {
                message: 'Operation log created successfully',
                data: savedLog // isteğe göre await this.findOne(savedLog.id)
            };
        } catch (error) {
            throw new Error(`Failed to create operation log: ${error.message}`);
        }
    }

    async remove(id: number): Promise<void> {
        await this.operationLogRepo.softDelete(id);
    }

    async findOne(id: number): Promise<OperationLog> {
        const logById = await this.operationLogRepo.findOne({ where: { id }, relations: ['createdBy', 'operation'] });
        if (!logById) throw new NotFoundException('Log not found');
        return logById;
    }
}