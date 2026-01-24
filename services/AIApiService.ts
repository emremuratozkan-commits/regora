/**
 * AI API Service
 * Frontend client for backend AI proxy endpoints
 */

import { config } from '../config';
import { authService } from './AuthService';

export interface AnalyzeFinancesRequest {
    debt: number;
    transactions?: {
        type: string;
        amount: number;
        date: string;
    }[];
    locale?: string;
}

export interface GenerateReportRequest {
    reportType: 'monthly' | 'quarterly' | 'annual' | 'custom';
    startDate?: string;
    endDate?: string;
    includeCharts?: boolean;
}

export interface ChatAssistantRequest {
    message: string;
    history?: {
        role: 'user' | 'assistant';
        content: string;
    }[];
    context?: string;
}

interface AIResponse<T> {
    data?: T;
    error?: string;
    cached?: boolean;
}

class AIApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${config.api.url}/api/ai`;
    }

    private async request<T>(endpoint: string, body: unknown): Promise<AIResponse<T>> {
        try {
            const headers = await authService.createAuthHeaders();

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    return { error: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.' };
                }

                if (response.status === 429) {
                    return { error: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.' };
                }

                return { error: errorData.message || 'Bir hata oluştu.' };
            }

            const data = await response.json();
            return { data, cached: data.cached };
        } catch (error) {
            console.error('AI API Error:', error);
            return { error: 'Sunucuya bağlanılamadı.' };
        }
    }

    async analyzeFinances(request: AnalyzeFinancesRequest): Promise<AIResponse<{ insight: string }>> {
        return this.request('/analyze-finances', request);
    }

    async generateReport(request: GenerateReportRequest): Promise<AIResponse<{ report: string; summary: string }>> {
        return this.request('/generate-report', request);
    }

    async chatAssistant(request: ChatAssistantRequest): Promise<AIResponse<{ reply: string }>> {
        return this.request('/chat-assistant', request);
    }
}

export const aiApiService = new AIApiService();
export default aiApiService;
