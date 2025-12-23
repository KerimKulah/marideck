# 🔧 Client IP Alma - Production Hazırlığı

## 🚨 Mevcut Durum ve Problem

### Şu An Ne Oluyor?

**Local Development:**
- `request.ip` → `127.0.0.1` ✅ (Doğru, tarayıcı sensin)

**Production (Proxy Arkasında):**
- `request.ip` → `127.0.0.1` veya proxy IP ❌ (Gerçek client IP kaybolur)

### Neden Problem?

Production'da genelde şu yapılar olur:
- Nginx reverse proxy
- Cloudflare
- AWS ALB / ELB
- Vercel / Render / Fly.io
- Docker + reverse proxy

Bu durumda Express'in `request.ip` değeri proxy'nin IP'sini verir, gerçek kullanıcı IP'sini değil.

---

## 📍 IP Kullanılan Yerler

### 1. `src/filters/exception-filter.ts`
**Satır:** ~65-67
```typescript
const { method, url, ip } = request;
const logMetadata = requestId ? { requestId, ip } : { ip };
```
**Durum:** ❌ `request.ip` kullanılıyor

### 2. `src/auth/auth-core/auth.controller.ts`
**Satır:** 30 (login metodu)
```typescript
const forwarded = req.headers['x-forwarded-for'];
const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
```
**Durum:** ⚠️ Kısmen doğru ama `trust proxy` olmadan tam çalışmaz

**Satır:** 53 (refreshAccess metodu)
```typescript
const forwarded = req.headers['x-forwarded-for'];
const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
```
**Durum:** ⚠️ Kısmen doğru ama `trust proxy` olmadan tam çalışmaz

---

## ✅ Production İçin Yapılacaklar

### 1️⃣ Trust Proxy Aç (KRİTİK - İLK YAPILACAK)

**Dosya:** `src/main.ts`
**Konum:** `bootstrap()` fonksiyonunun başında, `app.useGlobalFilters()` öncesi

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚨 PRODUCTION: Trust proxy açılmalı
  app.set('trust proxy', true);

  // Global exception filter
  app.useGlobalFilters(new ExceptionFilterImp());
  // ... rest of the code
}
```

**Neden Kritik?**
- Bu olmadan `request.ip` doğru çalışmaz
- `x-forwarded-for` header'ından IP alınsa bile Express'in IP parsing'i yanlış olur
- **Bu ayar olmadan aşağıdaki hiçbir şey tam çalışmaz**

---

### 2️⃣ IP Alma Utility Fonksiyonu Oluştur

**Dosya:** `src/common/utils/get-client-ip.ts` (yeni dosya oluştur)

```typescript
import { Request } from 'express';

/**
 * Production-safe client IP alma fonksiyonu
 * 
 * Fallback sırası:
 * 1. x-forwarded-for header (ilk IP, virgülle ayrılmış listeden)
 * 2. request.ip (trust proxy açıksa doğru çalışır)
 * 3. request.socket.remoteAddress (fallback)
 * 4. 'unknown' (hiçbiri yoksa)
 * 
 * @param request Express Request objesi
 * @returns Client IP adresi
 */
export function getClientIp(request: Request): string {
  // x-forwarded-for: "client-ip, proxy1-ip, proxy2-ip"
  // İlk IP gerçek client IP'sidir
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  // Trust proxy açıksa request.ip doğru çalışır
  if (request.ip) {
    return request.ip;
  }

  // Son fallback
  return request.socket?.remoteAddress || 'unknown';
}
```

---

### 3️⃣ ExceptionFilter'da IP Alma Güncelle

**Dosya:** `src/filters/exception-filter.ts`

**Değişiklik:**
```typescript
import { getClientIp } from '../common/utils/get-client-ip';

// ... existing code ...

private logException(
    exception: any,
    request: Request,
    status: number,
    message: any,
    requestId?: string
): void {
    const { method, url } = request;
    const ip = getClientIp(request); // ✅ Utility fonksiyonu kullan
    const logContext = `${method} ${url} - ${status}`;
    const logMetadata = requestId ? { requestId, ip } : { ip };
    
    // ... rest of the code
}
```

---

### 4️⃣ AuthController'da IP Alma Güncelle

**Dosya:** `src/auth/auth-core/auth.controller.ts`

**Değişiklik:**
```typescript
import { getClientIp } from 'src/common/utils/get-client-ip';

// ... existing code ...

@Post('login')
async login(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const ip = getClientIp(req); // ✅ Utility fonksiyonu kullan
    const device = req.get('user-agent') || 'unknown';
    
    // ... rest of the code
}

@Post('refresh-access')
async refreshAccess(@Body() refreshDto: RefreshAccessRequestDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<RefreshAccessDto> {
    const ip = getClientIp(req); // ✅ Utility fonksiyonu kullan
    const device = req.get('user-agent') || 'unknown';
    
    // ... rest of the code
}
```

---

## 🔐 Güvenlik Notları

### x-forwarded-for Header Güvenliği

**Risk:**
- `x-forwarded-for` header'ı client tarafından spoof edilebilir

**Çözüm:**
- **Cloudflare / AWS ALB / Nginx** gibi trusted proxy'ler bu header'ı overwrite eder
- `trust proxy` ayarı ile Express sadece trusted proxy'lerden gelen header'ları kabul eder
- Infrastructure doğru yapılandırılmışsa güvenli

### Çok Kritik Sistemler İçin Ekstra Önlemler

Eğer IP güvenlik için kritikse (rate limiting, fraud detection vb.):

1. **Sadece ilk IP'yi kullan** (zaten yapıyoruz)
2. **Sadece trusted proxy'den gelen header'ları kabul et** (`trust proxy` ile)
3. **IP whitelist/blacklist kontrolü ekle**
4. **Rate limiting middleware'i ile entegre et**

---

## 📋 Yapılacaklar Checklist

- [ ] **1. Trust Proxy Aç**
  - [ ] `src/main.ts` dosyasını aç
  - [ ] `app.set('trust proxy', true);` ekle
  - [ ] Test et (local'de çalışmaya devam etmeli)

- [ ] **2. Utility Fonksiyonu Oluştur**
  - [ ] `src/common/utils/` klasörü oluştur (yoksa)
  - [ ] `get-client-ip.ts` dosyası oluştur
  - [ ] Fonksiyonu yaz ve export et

- [ ] **3. ExceptionFilter Güncelle**
  - [ ] `src/filters/exception-filter.ts` dosyasını aç
  - [ ] `getClientIp` import et
  - [ ] `request.ip` yerine `getClientIp(request)` kullan
  - [ ] Test et

- [ ] **4. AuthController Güncelle**
  - [ ] `src/auth/auth-core/auth.controller.ts` dosyasını aç
  - [ ] `getClientIp` import et
  - [ ] `login()` metodundaki IP alma kodunu güncelle
  - [ ] `refreshAccess()` metodundaki IP alma kodunu güncelle
  - [ ] Test et

- [ ] **5. Production Test**
  - [ ] Production ortamında deploy et
  - [ ] Logları kontrol et (IP'ler doğru mu?)
  - [ ] Refresh token kayıtlarını kontrol et (IP'ler doğru mu?)

---

## 🧪 Test Senaryoları

### Local Test
```bash
# Local'de çalışmaya devam etmeli
curl http://localhost:4000/api/auth/login
# IP: 127.0.0.1 olmalı ✅
```

### Production Test (Proxy Arkasında)
```bash
# Production'da gerçek client IP görünmeli
curl -H "X-Forwarded-For: 203.0.113.1" https://your-api.com/api/auth/login
# IP: 203.0.113.1 olmalı ✅ (127.0.0.1 değil)
```

### Log Kontrolü
```bash
# ExceptionFilter loglarında IP kontrolü
# AuthController refresh token kayıtlarında IP kontrolü
```

---

## 📚 Referanslar

- [Express Trust Proxy](https://expressjs.com/en/guide/behind-proxies.html)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [x-forwarded-for Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)

---

## ⚠️ Önemli Hatırlatmalar

1. **Trust proxy ayarı olmadan hiçbir şey çalışmaz** - İlk yapılacak bu!
2. **Utility fonksiyonu merkezi çözüm** - Her yerde aynı mantık
3. **Production'da mutlaka test et** - Local'de farklı davranabilir
4. **Infrastructure yapılandırması önemli** - Proxy doğru ayarlanmalı

---

**Son Güncelleme:** Production deployment öncesi hazırlık notları

