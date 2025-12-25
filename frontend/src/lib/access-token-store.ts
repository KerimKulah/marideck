import api from '@/api/axios';

// Memory'de token tutuyoruz (XSS saldırılarına karşı daha güvenli)
let accessToken: string | null = null;

/**
 * Access token'ı memory'ye kaydeder ve axios header'ına ekler
 */
export const setAccessToken = (token: string): void => {
    accessToken = token;
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

/**
 * Access token'ı memory'den siler ve axios header'ından kaldırır
 */
export const removeAccessToken = (): void => {
    accessToken = null;
    delete api.defaults.headers.common["Authorization"];
}

/**
 * Memory'deki access token'ı döner
 */
export const getAccessToken = (): string | null => {
    return accessToken;
}

/**
 * Token'ın var olup olmadığını kontrol eder
 */
export const hasAccessToken = (): boolean => {
    return accessToken !== null;
}

