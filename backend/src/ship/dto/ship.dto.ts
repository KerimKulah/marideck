import { IsNotEmpty, IsOptional } from "class-validator";

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
    lat?: number; // Enlem (y)

    @IsOptional()
    lon?: number; // Boylam (x)

    @IsOptional()
    speed?: number; // Hız (knot)

    @IsOptional()
    course?: number; // Yön (derece) 

    @IsOptional()
    eta?: Date; // Tahmini varış zamanı

    @IsOptional()
    etd?: Date; // Tahmini kalkış zamanı (Eğer veri varsa)

    @IsOptional()
    lastPort?: string; // Son liman

    @IsOptional()
    nextPort?: string; // Sonraki liman

    @IsOptional()
    status?: string; // Durum (active, berthed vb.)

    @IsOptional()
    shipOwner?: string; // Gemi sahibi

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
