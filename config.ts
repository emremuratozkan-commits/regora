/**
 * Application Configuration
 * Centralized, type-safe access to environment variables
 */

interface AppConfig {
    // API Configuration
    api: {
        url: string;
        timeout: number;
    };

    // Security Configuration
    security: {
        sessionEncryptionKey: string;
        tokenExpiryMinutes: number;
        refreshTokenExpiryDays: number;
    };

    // Feature Flags
    features: {
        enableMockAuth: boolean;
        enableDebugTools: boolean;
    };

    // Environment
    env: {
        isDevelopment: boolean;
        isProduction: boolean;
        mode: string;
    };
}

function getEnvVar(key: string, defaultValue: string = ''): string {
    return (import.meta.env[key] as string | undefined) ?? defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    if (value === undefined || typeof value !== 'string') return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value === 'true' || value === '1';
}

/**
 * Application configuration object
 * All environment variables are accessed through this object
 */
export const config: AppConfig = {
    api: {
        url: getEnvVar('VITE_API_URL', 'http://localhost:4001'),
        timeout: getEnvNumber('VITE_API_TIMEOUT', 30000)
    },

    security: {
        sessionEncryptionKey: getEnvVar(
            'VITE_SESSION_ENCRYPTION_KEY',
            'regora-default-key-change-in-production'
        ),
        tokenExpiryMinutes: getEnvNumber('VITE_TOKEN_EXPIRY_MINUTES', 15),
        refreshTokenExpiryDays: getEnvNumber('VITE_REFRESH_TOKEN_EXPIRY_DAYS', 7)
    },

    features: {
        enableMockAuth: getEnvBoolean('VITE_ENABLE_MOCK_AUTH', true),
        enableDebugTools: import.meta.env.DEV
    },

    env: {
        isDevelopment: import.meta.env.DEV,
        isProduction: import.meta.env.PROD,
        mode: import.meta.env.MODE
    }
};

export default config;
