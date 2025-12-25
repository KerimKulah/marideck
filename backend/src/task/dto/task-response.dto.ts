import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export class TaskUserDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photo?: string;
}

export class TaskCustomerDto {
    id: number;
    name: string;
}

export class TaskShipDto {
    id: number;
    name: string;
    imoNumber: string;
}

export class TaskOperationDto {
    id: number;
    name: string;
}

export class TaskResponseDto {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    assignedTo: TaskUserDto[];
    createdBy: TaskUserDto;
    customer?: TaskCustomerDto;
    ship?: TaskShipDto;
    operation?: TaskOperationDto;
    createdAt?: string;
    updatedAt?: string;
}
