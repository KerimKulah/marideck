export class UserDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string; 
    phone: string;
    roles: { id: number; name: string }[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}