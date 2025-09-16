import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";
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
    name: string;

    @IsNotEmpty({ message: 'Email zorunlu' })
    @IsEmail({}, { message: 'Geçersiz e-posta formatı' })
    email: string;

    @IsNotEmpty({ message: 'Telefon zorunlu' })
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    taxNumber?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsString()
    lastTransactionDate?: string;

    @IsOptional()
    @Transform(({ value }) => normalizeCustomerType(value))
    @IsEnum(CustomerType, { message: 'Geçersiz müşteri tipi' })
    customerType?: CustomerType;
}
