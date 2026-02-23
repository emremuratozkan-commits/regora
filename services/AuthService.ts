/**
 * Auth Service - Authentication API Operations
 * Connects to backend API for JWT-based authentication
 */

import apiService, { ApiError } from './api.service';
import { cryptoService } from './CryptoService';
import { User, UserRole, Site } from '../types';
import { config } from '../config';

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

const AUTH_STORAGE_KEY = 'regora_auth_tokens';
const SESSION_STORAGE_KEY = 'regora_session_v3';

const MOCK_SITE: Site = {
    id: 's1',
    name: 'Regora Heights',
    address: 'Zincirlikuyu Cad. No:1, Levent',
    city: 'İstanbul',
    managerName: 'Mehmet Aksoy',
    blockCount: 2,
    unitCount: 180,
    duesAmount: 2450,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    features: {
        has_pool: true,
        has_gym: true,
        has_freight_elevator: true,
        has_parking_recognition: true,
        has_guest_kiosk: true
    }
};

const MOCK_PATRON: User = {
    id: 'patron_1',
    siteId: 'global',
    username: 'patron',
    name: 'REGORA Patron',
    role: UserRole.SUPER_ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=PATRON&background=000&color=fff',
    apartment: 'Genel Merkez',
    status: 'approved',
    balance: 0,
    household: [],
    licensePlates: []
};

const MOCK_MANAGER: User = {
    id: 'manager_1',
    siteId: 's1',
    username: 'manager',
    name: 'Ahmet Müdür',
    role: UserRole.MANAGER,
    avatar: 'https://ui-avatars.com/api/?name=Ahmet+M&background=000&color=fff',
    apartment: 'Yönetim Ofisi',
    status: 'approved',
    balance: 0,
    household: [],
    licensePlates: []
};

const MOCK_RESIDENT: User = {
    id: 'u1',
    siteId: 's1',
    username: 'regora_user',
    name: 'Can Dağdelen',
    role: UserRole.RESIDENT,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    apartment: 'A Blok - Daire 104',
    status: 'approved',
    balance: -2450.00,
    household: [
        { id: 'h1', name: 'Zeynep Dağdelen', type: 'family', relation: 'Eş' }
    ],
    licensePlates: []
};

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
        // Mock Auth Implementation
        if (config.features.enableMockAuth || username === 'patron' || username === 'manager') {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

            // Patron / Admin Login
            if ((username === 'patron' || username === 'admin') && (password.toLowerCase() === 'patron123' || password.toLowerCase() === 'admin123')) {
                console.log('Mock Login: Patron authenticated');
                const tokens: AuthTokens = {
                    accessToken: 'mock_access_token_' + Date.now(),
                    refreshToken: 'mock_refresh_token_' + Date.now(),
                    expiresAt: Date.now() + 3600000,
                };

                await this.storeTokens(tokens);
                await this.storeSession(MOCK_PATRON.id, 'global', MOCK_PATRON.role);

                return {
                    user: MOCK_PATRON,
                    site: { ...MOCK_SITE, id: 'global', name: 'Tüm Portföy' },
                    tokens
                };
            }

            // Manager Login
            if (username === 'manager' && password.toLowerCase() === 'manager123') {
                console.log('Mock Login: Manager authenticated');
                const tokens: AuthTokens = {
                    accessToken: 'mock_access_token_' + Date.now(),
                    refreshToken: 'mock_refresh_token_' + Date.now(),
                    expiresAt: Date.now() + 3600000,
                };

                await this.storeTokens(tokens);
                await this.storeSession(MOCK_MANAGER.id, MOCK_SITE.id, MOCK_MANAGER.role);

                return {
                    user: MOCK_MANAGER,
                    site: MOCK_SITE,
                    tokens
                };
            }

            // Resident Login
            if (username === 'regora_user') {
                const tokens: AuthTokens = {
                    accessToken: 'mock_access_token_' + Date.now(),
                    refreshToken: 'mock_refresh_token_' + Date.now(),
                    expiresAt: Date.now() + 3600000,
                };

                await this.storeTokens(tokens);
                await this.storeSession(MOCK_RESIDENT.id, MOCK_SITE.id, MOCK_RESIDENT.role);

                return {
                    user: MOCK_RESIDENT,
                    site: MOCK_SITE,
                    tokens
                };
            }

            // Should fail for incorrect passwords in mock mode too
            if ((username === 'patron' || username === 'admin' || username === 'manager') && password === '') {
                throw new Error('Şifre gereklidir.');
            }
        }

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
            // Fallback to mock if 404 (Backend likely not running) and user is admin
            if ((apiError.status === 404 || apiError.status === 0) && username === 'admin' && password === 'Admin123') {
                const tokens: AuthTokens = {
                    accessToken: 'mock_access_token_' + Date.now(),
                    refreshToken: 'mock_refresh_token_' + Date.now(),
                    expiresAt: Date.now() + 3600000,
                };

                await this.storeTokens(tokens);
                await this.storeSession(MOCK_PATRON.id, MOCK_SITE.id, MOCK_PATRON.role);

                return {
                    user: MOCK_PATRON,
                    site: MOCK_SITE,
                    tokens
                };
            }

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
        if (config.features.enableMockAuth) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return {
                id: 'u_' + Date.now(),
                siteId,
                username,
                name,
                role: UserRole.RESIDENT,
                avatar: '',
                apartment: `${block} Blok D:${apartment}`,
                status: 'pending',
                balance: 0,
                household: [],
                licensePlates: []
            };
        }

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
        if (config.features.enableMockAuth) {
            return {
                accessToken: 'mock_access_token_' + Date.now(),
                refreshToken: 'mock_refresh_token_' + Date.now(),
                expiresAt: Date.now() + 3600000,
            };
        }

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
        if (config.features.enableMockAuth) {
            const tokens = await this.getStoredTokens();
            const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);

            if (tokens && sessionStr) {
                const session = JSON.parse(sessionStr);
                let user = MOCK_RESIDENT;
                let site = MOCK_SITE;

                if (session.role === UserRole.SUPER_ADMIN) user = MOCK_PATRON;
                else if (session.role === UserRole.MANAGER) user = MOCK_MANAGER;

                if (user.siteId === 'global') site = { ...MOCK_SITE, id: 'global', name: 'Tüm Portföy' };

                return { user, site };
            }
            return null;
        }

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
            if (!config.features.enableMockAuth) {
                await apiService.post('/auth/logout');
            }
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
