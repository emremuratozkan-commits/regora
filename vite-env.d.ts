/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_API_TIMEOUT: string;
    readonly VITE_SESSION_ENCRYPTION_KEY: string;
    readonly VITE_TOKEN_EXPIRY_MINUTES: string;
    readonly VITE_REFRESH_TOKEN_EXPIRY_DAYS: string;
    readonly VITE_ENABLE_MOCK_AUTH: string;
    readonly GEMINI_API_KEY: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
    // Index signature for dynamic environment variable access
    readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
