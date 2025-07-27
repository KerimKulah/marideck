import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, MaxLength } from "class-validator";


export class RegisterDto {
    @IsEmail()
    @IsNotEmpty({ message: 'Email cannot be empty' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(20, { message: 'Password cannot exceed 20 characters' })
    @Matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]*$/, { message: 'Password must contain at least one letter and one number' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Confirm password cannot be empty' })
    confirmPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'First name cannot be empty' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'Last name cannot be empty' })
    lastName: string;
}
