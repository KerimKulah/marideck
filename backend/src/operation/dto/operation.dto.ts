
import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional } from "class-validator";

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
    @IsString()
    status: string;

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