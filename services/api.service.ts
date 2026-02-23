/**
 * API Service - Axios Instance with Interceptors
 * Centralized HTTP client for all API requests
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    meta?: {
        requestId: string;
        duration?: string;
    };
}

export interface ApiError {
    code: string;
    message: string;
    status: number;
}

// Token storage key
const AUTH_STORAGE_KEY = 'regora_auth_tokens';

// Token refresh promise to prevent multiple refresh calls
let refreshPromise: Promise<string | null> | null = null;

/**
 * Get stored tokens from localStorage
 */
const getStoredTokens = (): { accessToken: string; refreshToken: string; expiresAt: number } | null => {
    try {
        const encrypted = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!encrypted) return null;
        // Note: In production, decrypt the tokens
        return JSON.parse(atob(encrypted.split('.')[1] || '{}'));
    } catch {
        return null;
    }
};

/**
 * Create Axios instance with base configuration
 */
const createApiInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: config.api.url,
        timeout: config.api.timeout,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor - Add auth token
    instance.interceptors.request.use(
        async (requestConfig: InternalAxiosRequestConfig) => {
            // Get token from localStorage
            const tokens = getStoredTokens();
            if (tokens?.accessToken) {
                requestConfig.headers.Authorization = `Bearer ${tokens.accessToken}`;
            }

            // Add request ID for tracking
            requestConfig.headers['X-Request-ID'] = crypto.randomUUID();

            // Development logging
            if (config.env.isDevelopment) {
                console.log(`[API] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
            }

            return requestConfig;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor - Handle errors and token refresh
    instance.interceptors.response.use(
        (response) => {
            // Development logging
            if (config.env.isDevelopment) {
                console.log(`[API] Response: ${response.status}`, response.data);
            }
            return response;
        },
        async (error: AxiosError<ApiResponse<unknown>>) => {
            const originalRequest = error.config;

            // Handle 401 - Try to refresh token
            if (error.response?.status === 401 && originalRequest) {
                // Avoid infinite loop
                if ((originalRequest as { _retry?: boolean })._retry) {
                    // Redirect to login
                    window.dispatchEvent(new CustomEvent('auth:expired'));
                    return Promise.reject(error);
                }

                (originalRequest as { _retry?: boolean })._retry = true;

                try {
                    // Use single refresh promise to prevent multiple refresh calls
                    if (!refreshPromise) {
                        refreshPromise = refreshToken();
                    }

                    const newToken = await refreshPromise;
                    refreshPromise = null;

                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return instance(originalRequest);
                    }
                } catch {
                    refreshPromise = null;
                    window.dispatchEvent(new CustomEvent('auth:expired'));
                }
            }

            // Format error for consistent handling
            const apiError: ApiError = {
                code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
                message: error.response?.data?.error?.message || error.message || 'Bir hata oluştu',
                status: error.response?.status || 500,
            };

            if (config.env.isDevelopment) {
                console.error('[API] Error:', apiError);
            }

            return Promise.reject(apiError);
        }
    );

    return instance;
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (): Promise<string | null> => {
    try {
        const tokens = getStoredTokens();
        if (!tokens?.refreshToken) return null;

        const response = await axios.post<ApiResponse<{ accessToken: string; expiresAt: number }>>(
            `${config.api.url}/auth/refresh`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${tokens.refreshToken}`,
                },
            }
        );

        if (response.data.success && response.data.data) {
            // Store new tokens
            const newTokens = {
                ...tokens,
                accessToken: response.data.data.accessToken,
                expiresAt: response.data.data.expiresAt,
            };
            localStorage.setItem(AUTH_STORAGE_KEY, btoa(JSON.stringify(newTokens)));
            return response.data.data.accessToken;
        }

        return null;
    } catch {
        return null;
    }
};

// Export singleton instance
export const api = createApiInstance();

// Helper methods for common operations
export const apiService = {
    get: <T>(url: string, params?: Record<string, unknown>) =>
        api.get<ApiResponse<T>>(url, { params }).then((res) => res.data),

    post: <T>(url: string, data?: unknown) =>
        api.post<ApiResponse<T>>(url, data).then((res) => res.data),

    put: <T>(url: string, data?: unknown) =>
        api.put<ApiResponse<T>>(url, data).then((res) => res.data),

    patch: <T>(url: string, data?: unknown) =>
        api.patch<ApiResponse<T>>(url, data).then((res) => res.data),

    delete: <T>(url: string) =>
        api.delete<ApiResponse<T>>(url).then((res) => res.data),
};

export default apiService;
