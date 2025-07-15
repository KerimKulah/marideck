import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export enum CustomerType {
    Armator = 'Armatör',
    Broker = 'Broker',
    FreightForwarder = 'Taşımacı',
    Acente = 'Acente',
    YukSahibi = 'Yük Sahibi',
    Exporter = 'İhracatçı',
    Importer = 'İthalatçı',
    TerminalOperator = 'Terminal Operatörü',
    PortAuthority = 'Port Yetkilisi',
    CustomsBroker = 'Gümrük Müşaviri',
    LegalRepresentative = 'Hukuk Temsilcisi',
    Diger = 'Diğer'
}

const normalizeCustomerType = (value: string): CustomerType | undefined => {
    if (!value) return undefined;

    const found = Object.entries(CustomerType).find(
        ([, val]) => val.toLowerCase() === value.toLowerCase()
    );
    return found?.[1] as CustomerType | undefined;
};

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
    @ApiPropertyOptional()
    address?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    taxNumber?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    notes?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    country?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    company?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    lastTransactionDate?: string;

    @IsOptional()
    @Transform(({ value }) => normalizeCustomerType(value))
    @IsEnum(CustomerType, { message: 'Geçersiz müşteri tipi' })
    @ApiPropertyOptional({ enum: CustomerType, description: 'Müşteri tipi (büyük/küçük harf duyarsız)' })
    customer_type?: CustomerType;
}
