import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CustomerDto {
    @IsNotEmpty({ message: 'Ad Soyad zorunlu' })
    @IsString()
    @ApiProperty()
    name: string;

    @IsNotEmpty({ message: 'Email zorunlu' })
    @IsEmail({}, { message: 'Geçersiz e-posta formatı' })
    @ApiProperty()
    email: string;

    @IsNotEmpty({ message: 'Telefon zorunlu' })
    @IsString()
    @ApiProperty()
    phone: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    address?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    taxNumber?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    notes?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    country?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    company?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    lastTransactionDate?: string;
}
