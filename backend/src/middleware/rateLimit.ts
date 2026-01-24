/**
 * Redis-based Rate Limiting Middleware
 * Limits requests per user with fallback to IP-based limiting
 */

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import config from '../config.js';

// In-memory fallback when Redis is unavailable
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

let redis: Redis | null = null;
let redisConnected = false;

// Initialize Redis connection
try {
    redis = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't retry, fall back to in-memory
        lazyConnect: true,
    });

    redis.on('connect', () => {
        redisConnected = true;
        console.log('📦 Redis connected for rate limiting');
    });

    redis.on('error', () => {
        redisConnected = false;
    });

    redis.connect().catch(() => {
        console.log('⚠️  Redis unavailable, using in-memory rate limiting');
    });
} catch {
    console.log('⚠️  Redis unavailable, using in-memory rate limiting');
}

async function getRateLimitFromRedis(key: string): Promise<{ count: number; ttl: number } | null> {
    if (!redis || !redisConnected) return null;

    try {
        const count = await redis.get(key);
        const ttl = await redis.ttl(key);
        return { count: parseInt(count || '0', 10), ttl };
    } catch {
        return null;
    }
}

async function incrementRateLimitInRedis(key: string, windowMs: number): Promise<number | null> {
    if (!redis || !redisConnected) return null;

    try {
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.pexpire(key, windowMs);
        }
        return count;
    } catch {
        return null;
    }
}

function getInMemoryRateLimit(key: string): { count: number; resetTime: number } {
    const now = Date.now();
    const entry = inMemoryStore.get(key);

    if (!entry || entry.resetTime <= now) {
        const newEntry = { count: 0, resetTime: now + config.rateLimitWindowMs };
        inMemoryStore.set(key, newEntry);
        return newEntry;
    }

    return entry;
}

function incrementInMemoryRateLimit(key: string): number {
    const entry = getInMemoryRateLimit(key);
    entry.count++;
    return entry.count;
}

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.userId || req.ip || 'anonymous';
    const key = `ratelimit:ai:${userId}`;
    const maxRequests = config.rateLimitMaxRequests;
    const windowMs = config.rateLimitWindowMs;

    let count: number;
    let resetTime: number;

    // Try Redis first
    const redisResult = await getRateLimitFromRedis(key);

    if (redisResult !== null) {
        count = await incrementRateLimitInRedis(key, windowMs) || redisResult.count + 1;
        resetTime = Date.now() + (redisResult.ttl * 1000);
    } else {
        // Fallback to in-memory
        count = incrementInMemoryRateLimit(key);
        const entry = inMemoryStore.get(key)!;
        resetTime = entry.resetTime;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

    if (count > maxRequests) {
        res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Max ${maxRequests} requests per minute.`,
            retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        });
        return;
    }

    next();
}

export default rateLimitMiddleware;
