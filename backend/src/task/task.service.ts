import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { TaskDto } from './dto/task.dto';

@Injectable()
export class TaskService {

    constructor(@InjectRepository(Task) private taskRepository: Repository<Task>) { }

    async findAll(page?: number, limit?: number, search?: string, tab?: 'active' | 'completed' | 'all') {
        const queryBuilder = this.taskRepository.createQueryBuilder('task');

        // Tab filtreleme
        if (tab === 'active') {
            queryBuilder.andWhere('task.status IN (:...activeStatuses)', { activeStatuses: ['pending', 'in_progress'] });
        } else if (tab === 'completed') {
            queryBuilder.andWhere('task.status = :status', { status: 'completed' });
        }
        // tab === 'all' ise filtre uygulanmaz

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

        const result: { tasks: Task[], tasksCount: number, page?: number, limit?: number, totalPages?: number } = {
            tasks,
            tasksCount,
        };

        if (page != null && limit != null) {
            result.page = page;
            result.limit = limit;
            result.totalPages = Math.ceil(tasksCount / limit);
        }

        return result;
    }

    async findOne(id: number): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id }
        });
        if (!task) throw new NotFoundException('Task not found');
        return task;
    }

    async create(taskDto: TaskDto) {
        const task = new Task();

        task.title = taskDto.title;
        task.description = taskDto.description;
        task.status = taskDto.status;
        task.priority = taskDto.priority;
        task.dueDate = taskDto.dueDate;

        try {
            const savedTask = await this.taskRepository.save(task);
            return { message: 'Task created successfully', data: savedTask };
        } catch (error) {
            throw new Error(`Failed to create task: ${error.message}`);
        }
    }

    async update(id: number, taskDto: TaskDto): Promise<{ message: string, data: Task }> {
        const task = await this.findOne(id);

        for (const [key, value] of Object.entries(taskDto)) {
            if (value !== undefined) {
                task[key] = value;
            }
        }

        const updated = await this.taskRepository.save(task);
        return { message: 'Task updated successfully', data: updated };
    }

    async remove(id: number): Promise<{ message: string }> {
        await this.taskRepository.softDelete(id);
        return { message: 'Task soft deleted successfully' };
    }

    async restore(id: number): Promise<{ message: string }> {
        await this.taskRepository.restore(id);
        return { message: 'Task restored successfully' };
    }

    async getStatistics() {
        // Aktif görevler (PENDING ve IN_PROGRESS)
        const activeTasksQuery = this.taskRepository.createQueryBuilder('task')
            .where('task.status IN (:...statuses)', { statuses: ['pending', 'in_progress'] });
        const activeTasksCount = await activeTasksQuery.getCount();

        // Tamamlanan görevler
        const completedTasksQuery = this.taskRepository.createQueryBuilder('task')
            .where('task.status = :status', { status: 'completed' });
        const completedTasksCount = await completedTasksQuery.getCount();

        // Bekleyen görevler
        const pendingTasksQuery = this.taskRepository.createQueryBuilder('task')
            .where('task.status = :status', { status: 'pending' });
        const pendingTasksCount = await pendingTasksQuery.getCount();

        // Devam eden görevler
        const inProgressTasksQuery = this.taskRepository.createQueryBuilder('task')
            .where('task.status = :status', { status: 'in_progress' });
        const inProgressTasksCount = await inProgressTasksQuery.getCount();

        // Öncelik bazlı sayılar
        const highPriorityQuery = this.taskRepository.createQueryBuilder('task')
            .where('task.priority = :priority', { priority: 'high' })
            .andWhere('task.status != :status', { status: 'completed' });
        const highPriorityCount = await highPriorityQuery.getCount();

        return {
            activeTasks: activeTasksCount,
            completedTasks: completedTasksCount,
            pendingTasks: pendingTasksCount,
            inProgressTasks: inProgressTasksCount,
            highPriorityTasks: highPriorityCount,
        };
    }
}

