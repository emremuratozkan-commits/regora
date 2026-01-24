/**
 * JWT Authentication Middleware
 * Validates Bearer tokens and extracts user info
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import type { TokenPayload, AuthenticatedRequest } from '../types.js';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedRequest['user'];
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
        return;
    }

    const token = authHeader.substring(7);

    try {
        // In development mode with mock auth, accept a simplified token format
        if (config.isDev && token.startsWith('dev_')) {
            const parts = token.split('_');
            req.user = {
                userId: parts[1] || 'dev-user',
                siteId: parts[2] || 'dev-site',
                role: parts[3] || 'RESIDENT',
            };
            next();
            return;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

        if (decoded.type !== 'access') {
            res.status(401).json({ error: 'Unauthorized', message: 'Invalid token type' });
            return;
        }

        req.user = {
            userId: decoded.userId,
            siteId: decoded.siteId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Unauthorized', message: 'Token expired' });
        } else {
            res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
        }
    }
}

export default authMiddleware;
