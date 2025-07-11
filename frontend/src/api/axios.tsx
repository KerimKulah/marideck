import { performLogout } from '@/lib/perform-logout';
import axios from 'axios';

interface FailedQueueItem {
    resolve: (token: string) => void;
    reject: (error: any) => void;
}

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
    console.log('🔁 processQueue çalıştı', { error, token, queueLength: failedQueue.length });

    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else if (token) resolve(token);
        else reject(new Error('No token to resolve'));
    });
    failedQueue = [];
};

// Her istekte access token eklenece    k
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        console.log('📤 Request interceptor', { url: config.url, token });

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.log('❌ Request error', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('✅ Response geldi', { url: response.config.url, status: response.status });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        console.log('⚠️ Response error', { url: originalRequest?.url, status: error?.response?.status });

        const isLoginOrRefreshRequest = ['/auth/login', '/auth/refresh-access'].some(path =>
            originalRequest.url?.endsWith(path)
        );

        if (isLoginOrRefreshRequest) {
            console.log('🔒 Login veya refresh isteği. Yeniden deneme yok.');
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('🔁 401 alındı, refresh deneniyor...');
            originalRequest._retry = true;

            if (isRefreshing) {
                console.log('⏳ Zaten refresh ediliyor, kuyruğa alındı.');
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            console.log('✅ Kuyruk işleniyor, yeni token eklendi');
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = 'Bearer ' + token;
                            }
                            resolve(api(originalRequest));
                        },
                        reject: (err: any) => {
                            console.log('❌ Kuyrukta hata', err);
                            reject(err);
                        },
                    });
                });
            }

            isRefreshing = true;

            try {
                console.log('🔄 Refresh request gönderiliyor...');
                const refreshResponse = await api.post('/auth/refresh-access');
                const newAccessToken = refreshResponse.data?.accessToken;

                if (!newAccessToken) {
                    console.log('❌ Refresh isteğinde accessToken dönmedi');
                    throw new Error('No access token in refresh response');
                }

                console.log('✅ Yeni accessToken alındı:', newAccessToken);
                localStorage.setItem('accessToken', newAccessToken);
                api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;

                processQueue(null, newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
                }

                return api(originalRequest);
            } catch (refreshError) {
                console.log('❌ Refresh işlemi başarısız:', refreshError);
                processQueue(refreshError, null);
                await performLogout();
                return Promise.reject(refreshError);
            } finally {
                console.log('🔚 Refresh süreci bitti');
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
