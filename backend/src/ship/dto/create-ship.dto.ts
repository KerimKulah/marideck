import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateShipDto {

    @IsNotEmpty()
    @ApiProperty({ example: "IMO1234567" })
    imoNumber: string;

    @IsNotEmpty()
    @ApiProperty({ example: "Ship Name" })
    name: string;

    @ApiProperty({ example: "Cargo" })
    type?: string;

    @ApiProperty({ example: "Turkish" })
    flag?: string;

    @ApiProperty({ example: "Previous Port" })
    previousPort?: string;  

    @ApiProperty({ example: "Operation Port" })
    operationPort?: string;

    @ApiProperty({ example: "Next Port" })
    nextPort?: string;

    @ApiProperty({ example: "Active" })
    status?: string;

    @ApiProperty({ example: "11.11.2025" })
    eta?: Date;

    @ApiProperty({ example: "11.11.2025" })
    etd?: Date;

    @ApiProperty({ example: "Ship Owner" })
    shipOwner?: string;

    @ApiProperty({ example: "Agent" })
    agent?: string;
}
