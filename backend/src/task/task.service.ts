import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Brackets, Repository, WhereExpressionBuilder, In } from 'typeorm';
import { TaskDto } from './dto/task.dto';
import { TaskResponseDto, TaskUserDto, TaskCustomerDto, TaskShipDto, TaskOperationDto } from './dto/task-response.dto';
import { User } from 'src/auth/user/entities/user.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Ship } from 'src/ship/entities/ship.entity';
import { Operation } from 'src/operation/entities/operation.entity';

@Injectable()
export class TaskService {

    constructor(
        @InjectRepository(Task) private taskRepository: Repository<Task>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Customer) private customerRepository: Repository<Customer>,
        @InjectRepository(Ship) private shipRepository: Repository<Ship>,
        @InjectRepository(Operation) private operationRepository: Repository<Operation>,
    ) { }

    // Helper method to convert Task entity to TaskResponseDto
    private toTaskResponseDto(task: Task): TaskResponseDto {
        const dto = new TaskResponseDto();
        dto.id = task.id;
        dto.title = task.title;
        dto.description = task.description;
        dto.status = task.status;
        dto.priority = task.priority;
        dto.dueDate = task.dueDate?.toISOString();
        dto.createdAt = task.createdAt.toISOString();
        dto.updatedAt = task.updatedAt.toISOString();

        // Convert assignedTo users to TaskUserDto
        dto.assignedTo = task.assignedTo?.map(user => {
            const userDto = new TaskUserDto();
            userDto.id = user.id;
            userDto.firstName = user.firstName;
            userDto.lastName = user.lastName;
            userDto.email = user.email;
            userDto.phone = user.phone;
            userDto.photo = user.photo;
            return userDto;
        }) || [];

        // Convert createdBy user to TaskUserDto
        if (task.createdBy) {
            const createdByDto = new TaskUserDto();
            createdByDto.id = task.createdBy.id;
            createdByDto.firstName = task.createdBy.firstName;
            createdByDto.lastName = task.createdBy.lastName;
            createdByDto.email = task.createdBy.email;
            createdByDto.phone = task.createdBy.phone;
            createdByDto.photo = task.createdBy.photo;
            dto.createdBy = createdByDto;
        }

        // Convert customer to TaskCustomerDto
        if (task.customer) {
            const customerDto = new TaskCustomerDto();
            customerDto.id = task.customer.id;
            customerDto.name = task.customer.name ?? '';
            dto.customer = customerDto;
        }

        // Convert ship to TaskShipDto
        if (task.ship) {
            const shipDto = new TaskShipDto();
            shipDto.id = task.ship.id;
            shipDto.name = task.ship.name ?? '';
            shipDto.imoNumber = task.ship.imoNumber ?? '';
            dto.ship = shipDto;
        }

        // Convert operation to TaskOperationDto
        if (task.operation) {
            const operationDto = new TaskOperationDto();
            operationDto.id = task.operation.id;
            operationDto.name = task.operation.name ?? '';
            dto.operation = operationDto;
        }

        return dto;
    }

    async findAll(
        userId: number,
        page?: number,
        limit?: number,
        search?: string,
        tab?: 'my-tasks-all' | 'my-tasks-pending' | 'my-tasks-in_progress' | 'my-tasks-completed' | 'all-tasks-all' | 'all-pending' | 'all-in_progress' | 'all-completed'
    ) {
        const queryBuilder = this.taskRepository.createQueryBuilder('task')
            .leftJoin('task.assignedTo', 'assignedTo')
            .leftJoin('task.createdBy', 'createdBy')
            .leftJoinAndSelect('task.customer', 'customer')
            .leftJoinAndSelect('task.ship', 'ship')
            .leftJoinAndSelect('task.operation', 'operation')
            // Select task fields
            .addSelect('task')
            // Select assignedTo fields (exclude password for security)
            .addSelect(['assignedTo.id', 'assignedTo.firstName', 'assignedTo.lastName', 'assignedTo.email', 'assignedTo.phone', 'assignedTo.photo'])
            // Select createdBy fields (exclude password for security)
            .addSelect(['createdBy.id', 'createdBy.firstName', 'createdBy.lastName', 'createdBy.email', 'createdBy.phone', 'createdBy.photo']);

        // Main tab filtering: my-tasks vs all-tasks
        if (tab?.startsWith('my-tasks')) {
            queryBuilder.innerJoin('task.assignedTo', 'filterAssignee', 'filterAssignee.id = :userId', { userId });
        }

        // Sub-tab filtering: status
        if (tab?.includes('pending')) {
            queryBuilder.andWhere('task.status = :status', { status: 'pending' });
        } else if (tab?.includes('in_progress')) {
            queryBuilder.andWhere('task.status = :status', { status: 'in_progress' });
        } else if (tab?.includes('completed')) {
            queryBuilder.andWhere('task.status = :status', { status: 'completed' });
        }
        // tab ends with 'all' means no status filter

        if (search && search.trim() !== '') {
            queryBuilder.andWhere(
                new Brackets((qb: WhereExpressionBuilder) => {
                    qb.where('task.title ILIKE :search', { search: `%${search}%` })
                        .orWhere('task.description ILIKE :search', { search: `%${search}%` });
                }),
            );
        }

        queryBuilder.orderBy('task.createdAt', 'DESC');

        if (page != null && limit != null) {
            queryBuilder.skip((page - 1) * limit).take(limit);
        }

        const [tasks, tasksCount] = await queryBuilder.getManyAndCount();

        const result: { tasks: TaskResponseDto[], tasksCount: number, page?: number, limit?: number, totalPages?: number } = {
            tasks: tasks.map(task => this.toTaskResponseDto(task)),
            tasksCount,
        };

        if (page != null && limit != null) {
            result.page = page;
            result.limit = limit;
            result.totalPages = Math.ceil(tasksCount / limit);
        }

        return result;
    }

    private async findEntity(id: number): Promise<Task> {
        const task = await this.taskRepository.createQueryBuilder('task')
            .leftJoin('task.assignedTo', 'assignedTo')
            .leftJoin('task.createdBy', 'createdBy')
            .leftJoinAndSelect('task.customer', 'customer')
            .leftJoinAndSelect('task.ship', 'ship')
            .leftJoinAndSelect('task.operation', 'operation')
            // Select task fields
            .addSelect('task')
            // Select assignedTo fields (exclude password for security)
            .addSelect(['assignedTo.id', 'assignedTo.firstName', 'assignedTo.lastName', 'assignedTo.email', 'assignedTo.phone', 'assignedTo.photo'])
            // Select createdBy fields (exclude password for security)
            .addSelect(['createdBy.id', 'createdBy.firstName', 'createdBy.lastName', 'createdBy.email', 'createdBy.phone', 'createdBy.photo'])
            .where('task.id = :id', { id })
            .getOne();

        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    async findOne(id: number): Promise<TaskResponseDto> {
        const task = await this.findEntity(id);
        return this.toTaskResponseDto(task);
    }

    async create(taskDto: TaskDto, userId: number) {
        // Validate dueDate: cannot be in the past
        if (taskDto.dueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for comparison

            const dueDate = new Date(taskDto.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                throw new BadRequestException('Bitiş tarihi bugünden önce olamaz');
            }
        }

        const task = new Task();

        task.title = taskDto.title;
        task.description = taskDto.description;
        task.status = taskDto.status;
        task.priority = taskDto.priority;
        task.dueDate = taskDto.dueDate;

        // Set assignedTo (multiple users) - exclude password for security
        const assignedUsers = await this.userRepository.findBy({
            id: In(taskDto.assignedToId)
        });
        if (assignedUsers.length !== taskDto.assignedToId.length) {
            throw new NotFoundException('One or more assigned users not found');
        }
        // Remove password from response
        task.assignedTo = assignedUsers.map(({ password, ...user }) => user as User);

        // Set createdBy (current user) - exclude password for security
        const createdByUser = await this.userRepository.findOne({ where: { id: userId } });
        if (!createdByUser) throw new NotFoundException('Creator user not found');
        const { password, ...createdByWithoutPassword } = createdByUser;
        task.createdBy = createdByWithoutPassword as User;

        // Set optional relationships
        if (taskDto.customerId) {
            const customer = await this.customerRepository.findOne({ where: { id: taskDto.customerId } });
            if (!customer) throw new NotFoundException('Customer not found');
            task.customer = customer;
        }

        if (taskDto.shipId) {
            const ship = await this.shipRepository.findOne({ where: { id: taskDto.shipId } });
            if (!ship) throw new NotFoundException('Ship not found');
            task.ship = ship;
        }

        if (taskDto.operationId) {
            const operation = await this.operationRepository.findOne({ where: { id: taskDto.operationId } });
            if (!operation) throw new NotFoundException('Operation not found');
            task.operation = operation;
        }

        try {
            const savedTask = await this.taskRepository.save(task);
            return { message: 'Task created successfully', data: this.toTaskResponseDto(savedTask) };
        } catch (error) {
            throw new Error(`Failed to create task: ${error.message}`);
        }
    }

    async update(id: number, taskDto: TaskDto, userId: number): Promise<{ message: string, data: TaskResponseDto }> {
        const task = await this.findEntity(id);

        // Get user with roles for permission check
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Permission check: only admin or assigned users can update
        const userRoles = user.roles?.map(role => role.name) || [];
        const isAdmin = userRoles.includes('admin');
        const isAssignedUser = task.assignedTo.some(user => user.id === userId);
        if (!isAdmin && !isAssignedUser) {
            throw new ForbiddenException('You do not have permission to update this task');
        }

        // Validate dueDate: cannot be in the past
        if (taskDto.dueDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of day for comparison

            const dueDate = new Date(taskDto.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                throw new BadRequestException('Bitiş tarihi bugünden önce olamaz');
            }
        }

        // Update basic fields
        task.title = taskDto.title;
        task.description = taskDto.description;
        task.status = taskDto.status;
        task.priority = taskDto.priority;
        task.dueDate = taskDto.dueDate;

        // Update assignedTo if provided - exclude password for security
        if (taskDto.assignedToId && taskDto.assignedToId.length > 0) {
            const assignedUsers = await this.userRepository.findBy({ id: In(taskDto.assignedToId) });
            if (assignedUsers.length !== taskDto.assignedToId.length) {
                throw new NotFoundException('One or more assigned users not found');
            }
            // Remove password from response
            task.assignedTo = assignedUsers.map(({ password, ...user }) => user as User);
        }

        // Update optional relationships
        if (taskDto.customerId !== undefined) {
            if (taskDto.customerId === null) {
                task.customer = undefined;
            } else {
                const customer = await this.customerRepository.findOne({ where: { id: taskDto.customerId } });
                if (!customer) throw new NotFoundException('Customer not found');
                task.customer = customer;
            }
        }

        if (taskDto.shipId !== undefined) {
            if (taskDto.shipId === null) {
                task.ship = undefined;
            } else {
                const ship = await this.shipRepository.findOne({ where: { id: taskDto.shipId } });
                if (!ship) throw new NotFoundException('Ship not found');
                task.ship = ship;
            }
        }

        if (taskDto.operationId !== undefined) {
            if (taskDto.operationId === null) {
                task.operation = undefined;
            } else {
                const operation = await this.operationRepository.findOne({ where: { id: taskDto.operationId } });
                if (!operation) throw new NotFoundException('Operation not found');
                task.operation = operation;
            }
        }

        const updated = await this.taskRepository.save(task);
        return { message: 'Task updated successfully', data: this.toTaskResponseDto(updated) };
    }

    async remove(id: number, userId: number): Promise<{ message: string }> {
        const task = await this.findEntity(id);

        // Get user with roles for permission check
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles']
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Permission check: only admin or assigned users can delete
        const userRoles = user.roles?.map(role => role.name) || [];
        const isAdmin = userRoles.includes('admin');
        const isAssignedUser = task.assignedTo.some(user => user.id === userId);
        if (!isAdmin && !isAssignedUser) {
            throw new ForbiddenException('You do not have permission to delete this task');
        }

        await this.taskRepository.softDelete(id);
        return { message: 'Task soft deleted successfully' };
    }

    async restore(id: number): Promise<{ message: string }> {
        await this.taskRepository.restore(id);
        return { message: 'Task restored successfully' };
    }

    async getStatistics(userId: number) {
        // My tasks - pending
        const myTasksPendingCount = await this.taskRepository.createQueryBuilder('task')
            .innerJoin('task.assignedTo', 'assignee')
            .where('assignee.id = :userId', { userId })
            .andWhere('task.status = :status', { status: 'pending' })
            .getCount();

        // My tasks - in progress
        const myTasksInProgressCount = await this.taskRepository.createQueryBuilder('task')
            .innerJoin('task.assignedTo', 'assignee')
            .where('assignee.id = :userId', { userId })
            .andWhere('task.status = :status', { status: 'in_progress' })
            .getCount();

        // My tasks - completed
        const myTasksCompletedCount = await this.taskRepository.createQueryBuilder('task')
            .innerJoin('task.assignedTo', 'assignee')
            .where('assignee.id = :userId', { userId })
            .andWhere('task.status = :status', { status: 'completed' })
            .getCount();

        // All tasks - pending
        const allPendingCount = await this.taskRepository.createQueryBuilder('task')
            .where('task.status = :status', { status: 'pending' })
            .getCount();

        // All tasks - in progress
        const allInProgressCount = await this.taskRepository.createQueryBuilder('task')
            .where('task.status = :status', { status: 'in_progress' })
            .getCount();

        // All tasks - completed
        const allCompletedCount = await this.taskRepository.createQueryBuilder('task')
            .where('task.status = :status', { status: 'completed' })
            .getCount();

        return {
            myTasksPending: myTasksPendingCount,
            myTasksInProgress: myTasksInProgressCount,
            myTasksCompleted: myTasksCompletedCount,
            myTasksAll: myTasksPendingCount + myTasksInProgressCount + myTasksCompletedCount,
            allPending: allPendingCount,
            allInProgress: allInProgressCount,
            allCompleted: allCompletedCount,
            allTasksAll: allPendingCount + allInProgressCount + allCompletedCount,
        };
    }
}

