# MaritimeDesk - Session, Authentication ve Güvenlik Yönetimi Dokümantasyonu

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Authentication Mimarisi](#authentication-mimarisi)
3. [Session Yönetimi](#session-yönetimi)
4. [Token Yönetimi](#token-yönetimi)
5. [Route Protection](#route-protection)
6. [API İstekleri ve Interceptors](#api-istekleri-ve-interceptors)
7. [State Management (Redux)](#state-management-redux)
8. [Güvenlik Önlemleri](#güvenlik-önlemleri)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Genel Bakış

MaritimeDesk frontend uygulaması, **JWT (JSON Web Token)** tabanlı bir authentication sistemi kullanmaktadır. Sistem şu ana bileşenlerden oluşur:

- **Access Token**: Her API isteğinde kullanılan kısa ömürlü token
- **Refresh Token**: Access token'ı yenilemek için kullanılan token (HTTP-only cookie'de saklanır)
- **Redux Toolkit**: Authentication state yönetimi
- **Axios Interceptors**: Otomatik token ekleme ve refresh mekanizması
- **Protected Routes**: Yetkisiz erişimi engelleyen route koruması

### Teknoloji Stack

- **Next.js 15.3.3** (App Router)
- **Redux Toolkit** (State Management)
- **Axios** (HTTP Client)
- **JWT** (Token-based Authentication)
- **localStorage** (Access Token Storage)

---

## 🔐 Authentication Mimarisi

### 1. Login İşlemi

Login işlemi `authSlice.tsx` içindeki `login` async thunk'ı ile gerçekleştirilir:

```typescript
// frontend/src/redux/slices/authSlice.tsx
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
    const response = await api.post("/auth/login", credentials);
    setAccessToken(response.data.accessToken);
    return response.data; // { accessToken, user, expiresAt }
})
```

**Akış:**
1. Kullanıcı email ve şifre ile giriş yapar
2. Backend'e POST `/auth/login` isteği gönderilir
3. Backend, access token ve kullanıcı bilgilerini döner
4. Access token `localStorage`'a kaydedilir
5. Redux state güncellenir (`isAuthenticated: true`)
6. Kullanıcı dashboard'a yönlendirilir

### 2. Logout İşlemi

Logout işlemi iki şekilde gerçekleştirilebilir:

**A) Redux Action ile:**
```typescript
dispatch(logout());
```

**B) Utility Fonksiyon ile:**
```typescript
import { performLogout } from '@/lib/perform-logout';
await performLogout();
```

**Akış:**
1. Backend'e POST `/auth/logout` isteği gönderilir
2. `localStorage`'dan access token silinir
3. Axios default headers'dan Authorization header'ı kaldırılır
4. Redux state temizlenir
5. Kullanıcı login sayfasına yönlendirilir

### 3. Current User Kontrolü

Sayfa yenilendiğinde veya uygulama başlatıldığında, mevcut kullanıcı bilgisi kontrol edilir:

```typescript
// frontend/src/redux/slices/authSlice.tsx
export const currentUser = createAsyncThunk("auth/currentUser", async (_, { rejectWithValue }) => {
    const response = await api.get("/auth/current-user");
    return response.data; // User DTO
})
```

Bu işlem `InitUser` component'i tarafından otomatik olarak tetiklenir.

---

## 📦 Session Yönetimi

### Session Bileşenleri

#### 1. InitUser Component

`InitUser` component'i, uygulama başlatıldığında veya sayfa yenilendiğinde kullanıcı bilgisini yükler:

```typescript
// frontend/src/components/providers/init-user.tsx
export default function InitUser({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    
    useEffect(() => {
        dispatch(clearError());
        dispatch(currentUser());
    }, [dispatch]);
    
    return <>{children}</>;
}
```

**Kullanım:**
- Login sayfasında ve dashboard layout'unda kullanılır
- Sayfa yenilendiğinde oturum durumunu kontrol eder
- Token varsa kullanıcı bilgisini yükler

#### 2. ProtectedRoute Component

`ProtectedRoute` component'i, yetkisiz erişimi engeller:

```typescript
// frontend/src/components/providers/protected-route.tsx
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, isInitialized } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    
    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isInitialized, isAuthenticated, router]);
    
    if (!isInitialized || loading) {
        return <Loading />;
    }
    
    if (!isAuthenticated) {
        return null;
    }
    
    return <>{children}</>;
}
```

**Özellikler:**
- Authentication durumunu kontrol eder
- Yetkisiz erişimde login sayfasına yönlendirir
- Loading state gösterir
- Hata durumlarını yönetir

### Session State Yönetimi

Redux store'da tutulan authentication state:

```typescript
interface AuthState {
    user: User | null;              // Kullanıcı bilgileri
    isAuthenticated: boolean;        // Oturum durumu
    loading: boolean;               // Yükleme durumu
    error: string | null;           // Hata mesajı
    isInitialized: boolean;         // İlk yükleme tamamlandı mı?
}
```

**State Geçişleri:**

1. **İlk Yükleme:**
   - `isInitialized: false` → `isInitialized: true`
   - `currentUser()` çağrılır

2. **Başarılı Login:**
   - `isAuthenticated: false` → `isAuthenticated: true`
   - `user` state'i güncellenir

3. **Logout:**
   - `isAuthenticated: true` → `isAuthenticated: false`
   - `user: null`
   - `isInitialized: false`

---

## 🎫 Token Yönetimi

### Access Token

**Saklama Yeri:** `localStorage`

**Kullanım:**
- Her API isteğinde `Authorization: Bearer <token>` header'ı olarak gönderilir
- Axios request interceptor tarafından otomatik eklenir

**Token Ayarlama:**
```typescript
export const setAccessToken = (token: string) => {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
```

**Token Kaldırma:**
```typescript
export const removeAccessToken = () => {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
}
```

### Refresh Token

**Saklama Yeri:** HTTP-only Cookie (Backend tarafından yönetilir)

**Kullanım:**
- Access token süresi dolduğunda otomatik olarak yenilenir
- Axios response interceptor tarafından yönetilir
- Kullanıcı müdahalesi gerektirmez

### Token Refresh Mekanizması

Sistem, 401 (Unauthorized) hatası aldığında otomatik olarak token'ı yeniler:

```typescript
// frontend/src/api/axios.tsx

// 1. 401 hatası yakalanır
if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    // 2. Zaten refresh işlemi devam ediyorsa, istek kuyruğa alınır
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }
    
    // 3. Refresh token ile yeni access token alınır
    isRefreshing = true;
    const refreshResponse = await api.post('/auth/refresh-access');
    const newAccessToken = refreshResponse.data?.accessToken;
    
    // 4. Yeni token kaydedilir ve kuyruktaki istekler işlenir
    localStorage.setItem('accessToken', newAccessToken);
    api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
    processQueue(null, newAccessToken);
    
    // 5. Orijinal istek yeni token ile tekrar gönderilir
    return api(originalRequest);
}
```

**Özellikler:**
- **Eşzamanlı İstek Yönetimi:** Aynı anda birden fazla 401 hatası alınırsa, sadece bir refresh işlemi yapılır, diğerleri kuyruğa alınır
- **Otomatik Retry:** Başarısız istek otomatik olarak yeni token ile tekrar denenir
- **Hata Yönetimi:** Refresh başarısız olursa kullanıcı otomatik olarak logout edilir

---

## 🛡️ Route Protection

### Dashboard Layout

Dashboard sayfaları `ProtectedRoute` ile korunur:

```typescript
// frontend/src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <InitUser>
            <ProtectedRoute>
                {/* Dashboard içeriği */}
            </ProtectedRoute>
        </InitUser>
    )
}
```

**Koruma Katmanları:**

1. **InitUser:** Kullanıcı bilgisini yükler
2. **ProtectedRoute:** Authentication kontrolü yapar
3. **Layout:** Sidebar ve header gösterir

### Login Sayfası

Login sayfası, zaten authenticated olan kullanıcıları dashboard'a yönlendirir:

```typescript
// frontend/src/components/login-form.tsx
useEffect(() => {
    if (isInitialized && isAuthenticated) {
        router.replace("/");
    }
}, [isInitialized, isAuthenticated, router]);
```

---

## 🌐 API İstekleri ve Interceptors

### Axios Konfigürasyonu

```typescript
// frontend/src/api/axios.tsx
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,  // Cookie'lerin gönderilmesi için
});
```

### Request Interceptor

Her istekte access token otomatik olarak eklenir:

```typescript
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
```

### Response Interceptor

401 hatalarında otomatik token refresh yapılır:

```typescript
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Token refresh mantığı burada
        // Detaylar için yukarıdaki "Token Refresh Mekanizması" bölümüne bakın
    }
);
```

### API Kullanımı

```typescript
import api from '@/api/axios';

// GET isteği
const response = await api.get('/endpoint');

// POST isteği
const response = await api.post('/endpoint', data);

// Token otomatik olarak eklenir, refresh otomatik yapılır
```

---

## 🗄️ State Management (Redux)

### Auth Slice

Authentication state'i Redux Toolkit ile yönetilir:

```typescript
// frontend/src/redux/slices/authSlice.tsx

// Actions
- login: Async thunk (giriş yapma)
- logout: Async thunk (çıkış yapma)
- currentUser: Async thunk (kullanıcı bilgisi yükleme)
- clearError: Sync action (hata temizleme)

// State
- user: User | null
- isAuthenticated: boolean
- loading: boolean
- error: string | null
- isInitialized: boolean
```

### Store Yapısı

```typescript
// frontend/src/redux/store.tsx
export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        // Diğer slice'lar...
    },
});
```

### Kullanım

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { login, logout } from '@/redux/slices/authSlice';

// State okuma
const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

// Action dispatch
const dispatch = useDispatch();
dispatch(login({ email, password }));
```

---

## 🔒 Güvenlik Önlemleri

### 1. Token Güvenliği

✅ **Yapılanlar:**
- Access token `localStorage`'da saklanır (XSS riski var, ancak pratik çözüm)
- Refresh token HTTP-only cookie'de saklanır (XSS'den korunur)
- Token'lar her istekte otomatik eklenir
- Token süresi dolduğunda otomatik yenilenir

⚠️ **Dikkat Edilmesi Gerekenler:**
- `localStorage` XSS saldırılarına karşı savunmasızdır
- Production'da HTTPS kullanılmalıdır
- Token'ların süresi backend'de kontrol edilmelidir

### 2. CORS ve Credentials

```typescript
// Axios konfigürasyonu
withCredentials: true  // Cookie'lerin gönderilmesi için
```

Backend'de CORS ayarları şu şekilde olmalıdır:
- `credentials: true` (CORS middleware)
- `Access-Control-Allow-Credentials: true` header'ı

### 3. Route Protection

- Tüm dashboard sayfaları `ProtectedRoute` ile korunur
- Yetkisiz erişimde otomatik yönlendirme yapılır
- Loading state'leri ile kullanıcı deneyimi korunur

### 4. Error Handling

- API hataları yakalanır ve kullanıcıya gösterilir
- Refresh token başarısız olursa otomatik logout yapılır
- Network hataları için retry mekanizması (gelecekte eklenebilir)

### 5. Input Validation

- Login form'unda email ve password validation yapılır
- Backend'de de validation yapılmalıdır

---

## ✨ Best Practices

### 1. Token Yönetimi

✅ **Doğru:**
```typescript
// Token'ı utility fonksiyonlar ile yönet
setAccessToken(token);
removeAccessToken();
```

❌ **Yanlış:**
```typescript
// Doğrudan localStorage'a erişme
localStorage.setItem("accessToken", token);
```

### 2. API İstekleri

✅ **Doğru:**
```typescript
// Axios instance kullan
import api from '@/api/axios';
await api.get('/endpoint');
```

❌ **Yanlış:**
```typescript
// Doğrudan axios kullanma
import axios from 'axios';
await axios.get('/endpoint');
```

### 3. Authentication Kontrolü

✅ **Doğru:**
```typescript
// Redux state'ten kontrol et
const { isAuthenticated } = useSelector((state: RootState) => state.auth);
```

❌ **Yanlış:**
```typescript
// localStorage'dan kontrol etme
const token = localStorage.getItem('accessToken');
if (token) { ... }
```

### 4. Error Handling

✅ **Doğru:**
```typescript
try {
    await dispatch(login(credentials));
} catch (error) {
    // Hata zaten Redux state'te
    const { error } = useSelector((state: RootState) => state.auth);
}
```

### 5. Component Yapısı

✅ **Doğru:**
```typescript
// Protected route'lar için layout kullan
<InitUser>
    <ProtectedRoute>
        {children}
    </ProtectedRoute>
</InitUser>
```

---

## 🐛 Troubleshooting

### Problem 1: Token Refresh Döngüsü

**Belirtiler:**
- Sürekli refresh isteği gönderiliyor
- Kullanıcı logout ediliyor

**Çözüm:**
- Backend'de refresh token'ın geçerli olduğundan emin olun
- `isRefreshing` flag'inin doğru çalıştığını kontrol edin
- Console log'larını inceleyin

### Problem 2: 401 Hatası Alınıyor

**Belirtiler:**
- API istekleri 401 döndürüyor
- Token refresh çalışmıyor

**Çözüm:**
1. `localStorage`'da token var mı kontrol edin
2. Token formatını kontrol edin (`Bearer ` prefix'i var mı?)
3. Backend'de token validation'ı kontrol edin
4. CORS ayarlarını kontrol edin

### Problem 3: Sayfa Yenilendiğinde Logout Oluyor

**Belirtiler:**
- Sayfa yenilendiğinde kullanıcı login sayfasına yönlendiriliyor

**Çözüm:**
1. `InitUser` component'inin doğru kullanıldığından emin olun
2. `currentUser()` action'ının başarılı çalıştığını kontrol edin
3. Token'ın `localStorage`'da olduğunu kontrol edin

### Problem 4: Cookie Gönderilmiyor

**Belirtiler:**
- Refresh token cookie'si backend'e ulaşmıyor

**Çözüm:**
1. `withCredentials: true` ayarını kontrol edin
2. Backend CORS ayarlarını kontrol edin
3. Cookie domain ve path ayarlarını kontrol edin
4. HTTPS kullanıyorsanız `Secure` flag'ini kontrol edin

### Problem 5: Eşzamanlı İsteklerde Token Sorunu

**Belirtiler:**
- Birden fazla istek aynı anda gönderildiğinde token sorunları

**Çözüm:**
- Token refresh queue mekanizması zaten mevcut
- `isRefreshing` flag'inin doğru çalıştığını kontrol edin
- `failedQueue` array'inin doğru yönetildiğini kontrol edin

---

## 📝 Önemli Notlar

1. **Development vs Production:**
   - Development'ta `http://localhost:3000/api` kullanılıyor
   - Production'da environment variable kullanılmalı

2. **Token Süresi:**
   - Access token süresi backend'de belirlenir
   - Refresh token süresi genellikle daha uzundur

3. **Logout:**
   - Logout işlemi hem frontend hem backend'de yapılmalı
   - Token'lar temizlenmeli

4. **Security Headers:**
   - Production'da güvenlik header'ları eklenmelidir (CSP, X-Frame-Options, vb.)

5. **Monitoring:**
   - Token refresh işlemleri loglanmalı
   - Hata durumları izlenmeli

---

## 🔄 Güncelleme Notları

- **v1.0.0** (Mevcut): İlk versiyon
  - JWT tabanlı authentication
  - Otomatik token refresh
  - Redux state management
  - Protected routes

---

## 📚 İlgili Dosyalar

- `frontend/src/api/axios.tsx` - Axios konfigürasyonu ve interceptors
- `frontend/src/redux/slices/authSlice.tsx` - Authentication state management
- `frontend/src/components/providers/protected-route.tsx` - Route protection
- `frontend/src/components/providers/init-user.tsx` - User initialization
- `frontend/src/lib/perform-logout.tsx` - Logout utility
- `frontend/src/components/login-form.tsx` - Login form component

---

**Son Güncelleme:** 2024
**Versiyon:** 1.0.0

