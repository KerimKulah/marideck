import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsDate, IsOptional, IsEnum, IsNumber } from "class-validator";
import { TaskStatus } from "../enums/task-status.enum";
import { TaskPriority } from "../enums/task-priority.enum";

export class TaskDto {

    @IsNotEmpty({ message: 'Başlık zorunlu' })
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty({ message: 'Durum zorunlu' })
    @IsEnum(TaskStatus, { message: 'Geçersiz durum değeri' })
    status: TaskStatus;

    @IsNotEmpty({ message: 'Öncelik zorunlu' })
    @IsEnum(TaskPriority, { message: 'Geçersiz öncelik değeri' })
    priority: TaskPriority;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dueDate?: Date;

    @IsNotEmpty({ message: 'Atanan kişiler zorunlu' })
    @IsNumber({}, { each: true })
    assignedToId: number[];

    @IsOptional()
    @IsNumber()
    customerId?: number;

    @IsOptional()
    @IsNumber()
    shipId?: number;

    @IsOptional()
    @IsNumber()
    operationId?: number;
}

