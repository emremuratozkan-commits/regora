/**
 * Type definitions for REGORA Backend
 */

export interface TokenPayload {
    userId: string;
    siteId: string;
    role: 'RESIDENT' | 'ADMIN' | 'TECHNICIAN';
    exp: number;
    iat: number;
    type: 'access' | 'refresh';
}

export interface AuthenticatedRequest {
    user: {
        userId: string;
        siteId: string;
        role: string;
    };
}

// AI Request/Response Types
export interface AnalyzeFinancesRequest {
    debt: number;
    transactions?: {
        type: string;
        amount: number;
        date: string;
    }[];
    locale?: string;
}

export interface AnalyzeFinancesResponse {
    insight: string;
    cached: boolean;
}

export interface GenerateReportRequest {
    reportType: 'monthly' | 'quarterly' | 'annual' | 'custom';
    startDate?: string;
    endDate?: string;
    includeCharts?: boolean;
}

export interface GenerateReportResponse {
    report: string;
    summary: string;
    cached: boolean;
}

export interface ChatAssistantRequest {
    message: string;
    history?: {
        role: 'user' | 'assistant';
        content: string;
    }[];
    context?: string;
}

export interface ChatAssistantResponse {
    reply: string;
    cached: boolean;
}

export interface RateLimitInfo {
    remaining: number;
    resetTime: number;
}
