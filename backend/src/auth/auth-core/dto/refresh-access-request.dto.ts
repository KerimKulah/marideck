import { IsOptional } from "class-validator";

export class RefreshAccessRequestDto {
    @IsOptional()
    public refreshTokenHash?: string;
}