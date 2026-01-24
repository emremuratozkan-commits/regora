/**
 * Application Configuration
 * Centralized environment variable access
 */

import 'dotenv/config';

export const config = {
    // Server
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',

    // Gemini API
    geminiApiKey: process.env.GEMINI_API_KEY || '',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),

    // Cache
    aiCacheTtl: parseInt(process.env.AI_CACHE_TTL || '300', 10),

    // CORS
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
};

export default config;
