import { AuthGuard } from "@nestjs/passport";

export class JwtGuard extends AuthGuard('jwt') { }

// Bu guard çalıştığında:
// JWT Strategy'yi çağırır ('jwt' string'i ile)
// Strategy şunları yapar:
// Token'ı header'dan çıkarır
// Secret key ile signature doğrular
// Expiry date kontrol eder
// Payload'ı decode eder 