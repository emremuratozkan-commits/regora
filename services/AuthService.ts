/**
 * Auth Service - Authentication API Operations
 * Connects to backend API for JWT-based authentication
 */

import apiService, { ApiError } from './api.service';
import { cryptoService } from './CryptoService';
import { User, UserRole, Site } from '../types';

// Token configuration from environment
const TOKEN_EXPIRY_MINUTES = parseInt(import.meta.env.VITE_TOKEN_EXPIRY_MINUTES || '15', 10);

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

export interface AuthResult {
    user: User;
    site: Site;
    tokens: AuthTokens;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    username: string;
    phoneNumber: string;
    siteId: string;
    block: string;
    apartment: string;
}

const AUTH_STORAGE_KEY = 'akrona_auth_tokens';
const SESSION_STORAGE_KEY = 'akrona_session_v3';

class AuthService {
    private refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private onTokenExpiredCallback: (() => void) | null = null;

    /**
     * Sets a callback to be called when token expires and cannot be refreshed
     */
    setOnTokenExpired(callback: () => void): void {
        this.onTokenExpiredCallback = callback;
    }

    /**
     * Authenticates a user via API and returns tokens
     */
    async login(username: string, password: string): Promise<AuthResult | null> {
        try {
            const response = await apiService.post<{
                user: User;
                site: Site;
                accessToken: string;
                refreshToken: string;
                expiresAt: number;
            }>('/auth/login', { username, password });

            if (response.success && response.data) {
                const { user, site, accessToken, refreshToken, expiresAt } = response.data;

                const tokens: AuthTokens = {
                    accessToken,
                    refreshToken,
                    expiresAt,
                };

                // Store tokens securely
                await this.storeTokens(tokens);

                // Store session
                await this.storeSession(user.id, site.id, user.role);

                // Setup auto-refresh
                this.scheduleTokenRefresh(tokens.expiresAt);

                return { user, site, tokens };
            }

            return null;
        } catch (error) {
            const apiError = error as ApiError;
            throw new Error(apiError.message || 'Giriş başarısız');
        }
    }

    /**
     * Registers a new user via API
     */
    async register(
        name: string,
        username: string,
        phoneNumber: string,
        siteId: string,
        block: string,
        apartment: string
    ): Promise<User | null> {
        try {
            const response = await apiService.post<User>('/auth/register', {
                name,
                username,
                phoneNumber,
                siteId,
                block,
                apartment,
            });

            if (response.success && response.data) {
                return response.data;
            }

            return null;
        } catch (error) {
            const apiError = error as ApiError;
            throw new Error(apiError.message || 'Kayıt başarısız');
        }
    }

    /**
     * Refreshes the access token using the refresh token
     */
    async refreshAccessToken(): Promise<AuthTokens | null> {
        const storedTokens = await this.getStoredTokens();
        if (!storedTokens) return null;

        try {
            const response = await apiService.post<{
                accessToken: string;
                expiresAt: number;
            }>('/auth/refresh');

            if (response.success && response.data) {
                const newTokens: AuthTokens = {
                    accessToken: response.data.accessToken,
                    refreshToken: storedTokens.refreshToken,
                    expiresAt: response.data.expiresAt,
                };

                await this.storeTokens(newTokens);
                this.scheduleTokenRefresh(newTokens.expiresAt);

                return newTokens;
            }

            return null;
        } catch {
            await this.logout();
            this.onTokenExpiredCallback?.();
            return null;
        }
    }

    /**
     * Validates if the current session is valid
     */
    async validateSession(): Promise<{ user: User; site: Site } | null> {
        const tokens = await this.getStoredTokens();
        if (!tokens) return null;

        try {
            const response = await apiService.get<{ user: User; site: Site }>('/auth/validate');

            if (response.success && response.data) {
                // Schedule token refresh
                this.scheduleTokenRefresh(tokens.expiresAt);
                return response.data;
            }

            return null;
        } catch {
            // Try to refresh token
            const newTokens = await this.refreshAccessToken();
            if (!newTokens) return null;

            // Retry validation
            try {
                const response = await apiService.get<{ user: User; site: Site }>('/auth/validate');
                if (response.success && response.data) {
                    return response.data;
                }
            } catch {
                // Give up
            }

            return null;
        }
    }

    /**
     * Logs out the user and clears all tokens
     */
    async logout(): Promise<void> {
        if (this.refreshTimeoutId) {
            clearTimeout(this.refreshTimeoutId);
            this.refreshTimeoutId = null;
        }

        // Try to invalidate token on backend
        try {
            await apiService.post('/auth/logout');
        } catch {
            // Ignore errors during logout
        }

        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        cryptoService.clearCache();
    }

    /**
     * Stores tokens encrypted in localStorage
     */
    private async storeTokens(tokens: AuthTokens): Promise<void> {
        const encrypted = await cryptoService.encrypt(JSON.stringify(tokens));
        localStorage.setItem(AUTH_STORAGE_KEY, encrypted);
    }

    /**
     * Stores session info in localStorage
     */
    private async storeSession(userId: string, siteId: string, role: UserRole): Promise<void> {
        const session = { userId, siteId, role, timestamp: Date.now() };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    /**
     * Retrieves and decrypts stored tokens
     */
    private async getStoredTokens(): Promise<AuthTokens | null> {
        try {
            const encrypted = localStorage.getItem(AUTH_STORAGE_KEY);
            if (!encrypted) return null;

            const decrypted = await cryptoService.decrypt(encrypted);
            return JSON.parse(decrypted) as AuthTokens;
        } catch {
            return null;
        }
    }

    /**
     * Schedules automatic token refresh before expiration
     */
    private scheduleTokenRefresh(expiresAt: number): void {
        if (this.refreshTimeoutId) {
            clearTimeout(this.refreshTimeoutId);
        }

        // Refresh 1 minute before expiration
        const refreshIn = expiresAt - Date.now() - 60000;

        if (refreshIn > 0) {
            this.refreshTimeoutId = setTimeout(async () => {
                const newTokens = await this.refreshAccessToken();
                if (!newTokens) {
                    this.onTokenExpiredCallback?.();
                }
            }, refreshIn);
        }
    }

    /**
     * Gets the current access token (for API calls)
     */
    async getAccessToken(): Promise<string | null> {
        const tokens = await this.getStoredTokens();
        if (!tokens) return null;

        // Check if token is expired
        if (tokens.expiresAt < Date.now()) {
            const newTokens = await this.refreshAccessToken();
            return newTokens?.accessToken || null;
        }

        return tokens.accessToken;
    }

    /**
     * Creates middleware for API requests with authentication header
     */
    async createAuthHeaders(): Promise<Record<string, string>> {
        const token = await this.getAccessToken();
        if (!token) return {};

        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }
}

export const authService = new AuthService();

// Listen for auth expired events from API service
window.addEventListener('auth:expired', () => {
    authService.logout();
});

export default authService;
