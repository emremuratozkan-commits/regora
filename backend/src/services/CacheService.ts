/**
 * Cache Service
 * Redis-based caching for AI responses
 */

import Redis from 'ioredis';
import crypto from 'crypto';
import config from '../config.js';

let redis: Redis | null = null;
let redisConnected = false;

// Initialize Redis connection
try {
    redis = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        lazyConnect: true,
    });

    redis.on('connect', () => {
        redisConnected = true;
        console.log('📦 Redis connected for caching');
    });

    redis.on('error', () => {
        redisConnected = false;
    });

    redis.connect().catch(() => {
        console.log('⚠️  Redis unavailable, caching disabled');
    });
} catch {
    console.log('⚠️  Redis unavailable, caching disabled');
}

function generateCacheKey(prefix: string, data: unknown): string {
    const hash = crypto
        .createHash('md5')
        .update(JSON.stringify(data))
        .digest('hex');
    return `cache:${prefix}:${hash}`;
}

export const cacheService = {
    async get<T>(prefix: string, data: unknown): Promise<T | null> {
        if (!redis || !redisConnected) return null;

        try {
            const key = generateCacheKey(prefix, data);
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    },

    async set<T>(prefix: string, data: unknown, value: T, ttl?: number): Promise<void> {
        if (!redis || !redisConnected) return;

        try {
            const key = generateCacheKey(prefix, data);
            await redis.setex(key, ttl || config.aiCacheTtl, JSON.stringify(value));
        } catch {
            // Silently fail caching
        }
    },

    async invalidate(prefix: string): Promise<void> {
        if (!redis || !redisConnected) return;

        try {
            const keys = await redis.keys(`cache:${prefix}:*`);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch {
            // Silently fail invalidation
        }
    },
};

export default cacheService;
