/**
 * Input Validation Middleware
 * Uses Zod schemas for request validation and prompt sanitization
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';

// Dangerous patterns for prompt injection prevention
const DANGEROUS_PATTERNS = [
    /ignore\s+(previous|all|above)\s+instructions/i,
    /disregard\s+(previous|all|above)/i,
    /forget\s+(everything|all|previous)/i,
    /you\s+are\s+now/i,
    /act\s+as\s+if/i,
    /pretend\s+(to\s+be|you\s+are)/i,
    /new\s+instructions?:/i,
    /system\s*prompt/i,
    /\[SYSTEM\]/i,
    /\[INST\]/i,
    /<\|.*\|>/,  // Special tokens
    /\{\{.*\}\}/, // Template injection
];

// Sensitive data patterns to filter
const SENSITIVE_PATTERNS = [
    /\b\d{16}\b/g,                    // Credit card numbers
    /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, // SSN
    /password\s*[:=]\s*\S+/gi,        // Password values
    /api[_-]?key\s*[:=]\s*\S+/gi,     // API keys
    /secret\s*[:=]\s*\S+/gi,          // Secrets
];

export function sanitizePrompt(text: string): string {
    let sanitized = text;

    // Filter sensitive data
    for (const pattern of SENSITIVE_PATTERNS) {
        sanitized = sanitized.replace(pattern, '[FILTERED]');
    }

    return sanitized;
}

export function checkPromptInjection(text: string): boolean {
    return DANGEROUS_PATTERNS.some(pattern => pattern.test(text));
}

// Validation schemas
export const analyzeFinancesSchema = z.object({
    debt: z.number().min(0).max(10000000),
    transactions: z.array(z.object({
        type: z.string().max(50),
        amount: z.number(),
        date: z.string().max(20),
    })).optional(),
    locale: z.string().max(10).default('tr'),
});

export const generateReportSchema = z.object({
    reportType: z.enum(['monthly', 'quarterly', 'annual', 'custom']),
    startDate: z.string().max(10).optional(),
    endDate: z.string().max(10).optional(),
    includeCharts: z.boolean().default(false),
});

export const chatAssistantSchema = z.object({
    message: z.string().min(1).max(2000),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
    })).max(20).optional(),
    context: z.string().max(500).optional(),
});

export function validate<T>(schema: ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;

            // Check for prompt injection in string fields
            const stringFields = Object.entries(validated as Record<string, unknown>)
                .filter(([, value]) => typeof value === 'string')
                .map(([, value]) => value as string);

            for (const field of stringFields) {
                if (checkPromptInjection(field)) {
                    res.status(400).json({
                        error: 'Bad Request',
                        message: 'Potentially harmful content detected',
                    });
                    return;
                }
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    error: 'Validation Error',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            } else {
                res.status(400).json({ error: 'Bad Request' });
            }
        }
    };
}

export default validate;
