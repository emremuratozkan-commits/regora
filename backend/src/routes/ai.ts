/**
 * AI Routes
 * API endpoints for AI services
 */

import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth.js';
import rateLimitMiddleware from '../middleware/rateLimit.js';
import {
    validate,
    analyzeFinancesSchema,
    generateReportSchema,
    chatAssistantSchema
} from '../middleware/validation.js';
import aiService from '../services/AIService.js';
import type {
    AnalyzeFinancesRequest,
    GenerateReportRequest,
    ChatAssistantRequest
} from '../types.js';

const router = Router();

// Apply auth and rate limiting to all AI routes
router.use(authMiddleware);
router.use(rateLimitMiddleware);

/**
 * POST /api/ai/analyze-finances
 * Analyze user's financial data
 */
router.post(
    '/analyze-finances',
    validate(analyzeFinancesSchema),
    async (req: Request, res: Response) => {
        try {
            const userId = req.user!.userId;
            const data = req.body as AnalyzeFinancesRequest;

            const result = await aiService.analyzeFinances(userId, data);

            res.json(result);
        } catch (error) {
            console.error('Analyze Finances Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

/**
 * POST /api/ai/generate-report
 * Generate financial report
 */
router.post(
    '/generate-report',
    validate(generateReportSchema),
    async (req: Request, res: Response) => {
        try {
            const userId = req.user!.userId;
            const data = req.body as GenerateReportRequest;

            const result = await aiService.generateReport(userId, data);

            res.json(result);
        } catch (error) {
            console.error('Generate Report Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

/**
 * POST /api/ai/chat-assistant
 * Chat with AI assistant
 */
router.post(
    '/chat-assistant',
    validate(chatAssistantSchema),
    async (req: Request, res: Response) => {
        try {
            const userId = req.user!.userId;
            const data = req.body as ChatAssistantRequest;

            const result = await aiService.chatAssistant(userId, data);

            res.json(result);
        } catch (error) {
            console.error('Chat Assistant Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

export default router;
