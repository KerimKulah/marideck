import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsDate, IsOptional, IsEnum } from "class-validator";
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
}

