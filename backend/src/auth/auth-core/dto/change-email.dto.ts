import { IsEmail, IsNotEmpty } from "class-validator";

export class ChangeEmailDto {
    @IsEmail()
    @IsNotEmpty({ message: 'Old email cannot be empty' })
    oldMail: string;

    @IsEmail()
    @IsNotEmpty({ message: 'New email cannot be empty' })
    newMail: string;
}