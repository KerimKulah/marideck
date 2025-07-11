import { Reflector } from "@nestjs/core";
import { Injectable } from "@nestjs/common";
import { CanActivate, ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { UserService } from "../../user/user.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly userService: UserService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
        const classRoles = this.reflector.get<string[]>('roles', context.getClass()) || [];
        const roles = [...requiredRoles, ...classRoles];

        if (roles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = await this.userService.findOne(request.user.id);

        if (!user) throw new UnauthorizedException('Kullanıcı doğrulanmamış');

        const userRoleNames = user.roles?.map(role => role.name) || [];

        if (!roles.some(role => userRoleNames.includes(role))) throw new ForbiddenException('Bu işlemi yapmaya yetkiniz yok');

        return true;
    }
}