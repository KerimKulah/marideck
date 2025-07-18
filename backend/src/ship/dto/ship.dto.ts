import { Type } from "class-transformer";
import { IsDate, IsDateString, IsNotEmpty, IsOptional } from "class-validator";

export class ShipDto {

    @IsOptional()
    imoNumber?: string;

    @IsOptional()
    mmsiNumber?: string;

    @IsOptional()
    callsign?: string;

    @IsOptional()
    name?: string;

    @IsOptional()
    type?: string;

    @IsOptional()
    flag?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    eta?: Date; // Tahmini varış zamanı

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    etd?: Date; // Tahmini kalkış zamanı (Eğer veri varsa)

    @IsOptional()
    departurePort?: string; // Kalkış liman

    @IsOptional()
    destinationPort?: string; // Varış liman

    @IsOptional()
    status?: string; // Durum (active, berthed vb.)

    @IsOptional()
    builtYear?: number; // İnşa yılı

    @IsOptional()
    grossTonnage?: number; // Brüt tonaj (GT)

    @IsOptional()
    deadweight?: number; // Deadweight tonaj (DWT)

    @IsOptional()
    draft?: number; // Draft (su çekimi)

    @IsOptional()
    length?: number; // Uzunluk (metre)

    @IsOptional()
    beam?: number; // Genişlik (metre)

    @IsOptional()
    notes?: string; // Notlar
}
