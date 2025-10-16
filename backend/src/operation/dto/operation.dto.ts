
import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional, IsEnum } from "class-validator";
import { OperationStatus } from "../enums/operation-status.enum";

export class OperationDto {

    @IsNotEmpty({ message: 'İsim zorunlu' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Tip zorunlu' })
    @IsString()
    type: string;

    @IsNotEmpty({ message: 'Detay zorunlu' })
    @IsString()
    details: string;

    @IsNotEmpty({ message: 'Port zorunlu' })
    @IsString()
    port: string;

    @IsNotEmpty({ message: 'Müşteri zorunlu' })
    @IsNumber()
    customerId: number;

    @IsNotEmpty({ message: 'Gemiler zorunlu' })
    @IsNumber()
    shipId: number;

    @IsNotEmpty({ message: 'Kullanıcılar zorunlu' })
    @IsNumber({}, { each: true })
    userId: number[];

    @IsNotEmpty({ message: 'Başlangıç tarihi zorunlu' })
    @IsDate()
    startDate: Date;

    @IsNotEmpty({ message: 'Bitiş tarihi zorunlu' })
    @IsDate()
    endDate: Date;

    @IsNotEmpty({ message: 'Durum zorunlu' })
    @IsEnum(OperationStatus, { message: 'Geçersiz durum değeri' })
    status: OperationStatus;

    @IsOptional()
    @IsString()
    cargoType?: string;

    @IsOptional()
    @IsString()
    cargoDetails?: string;

    @IsOptional()
    @IsDate()
    finishedAt?: Date;
}