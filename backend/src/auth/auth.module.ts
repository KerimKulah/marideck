import { Module } from "@nestjs/common";
import { RoleModule } from "./role/role.module";
import { UserModule } from "./user/user.module";
import { AuthCoreModule } from "./auth-core/auth-core.module";
import { SeedService } from "./seed/seed.service";

@Module({
    imports: [RoleModule, UserModule, AuthCoreModule],
    providers: [SeedService],
    exports: [RoleModule, UserModule, AuthCoreModule],
})

export class AuthModule { }
