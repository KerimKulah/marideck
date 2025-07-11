import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CustomerDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString()
    @ApiProperty()
    name: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    @ApiProperty()
    email: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    phone?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    address?: string;

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
