import { IsNotEmpty, IsString, IsInt, IsOptional } from "class-validator";

export class OperationLogDto {
    @IsNotEmpty({ message: 'Operasyon zorunlu' })
    @IsInt()
    operationId: number;

    @IsNotEmpty({ message: 'Oluşturan zorunlu' }) // Kalkması gerekebilir.
    @IsInt()
    createdById: number;

    @IsNotEmpty({ message: 'Açıklama zorunlu' })
    @IsString()
    description: string;
}
