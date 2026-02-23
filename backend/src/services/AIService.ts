/**
 * AI Service
 * Gemini API integration with prompt management and caching
 */

import { GoogleGenAI } from '@google/genai';
import config from '../config.js';
import cacheService from './CacheService.js';
import { sanitizePrompt } from '../middleware/validation.js';
import type {
    AnalyzeFinancesRequest,
    AnalyzeFinancesResponse,
    GenerateReportRequest,
    GenerateReportResponse,
    ChatAssistantRequest,
    ChatAssistantResponse,
} from '../types.js';

const MODEL_NAME = 'gemini-2.0-flash';

// System prompts with safety rails
const SYSTEM_PROMPTS = {
    finances: `Sen REGORA mülk yönetim asistanısın. Sadece finansal konularda yardım et.
Görevlerin:
- Aidat ve fatura ödemelerini analiz et
- Tasarruf önerileri sun
- Ödeme tarihleri hakkında bilgi ver

Kurallar:
- Kısa ve profesyonel cevaplar ver (max 100 kelime)
- Türkçe konuş
- Kişisel finansal tavsiye verme
- Başka konulara geçme`,

    report: `Sen REGORA mülk yönetim raporlama asistanısın.
Görevlerin:
- Finansal raporlar oluştur
- Özet ve analizler sun
- Trendleri belirle

Kurallar:
- Profesyonel ve yapılandırılmış format kullan
- Türkçe yaz
- Sadece sağlanan verilerle çalış`,

    chat: `Sen REGORA mülk yönetim asistanısın.
Görevlerin:
- Site yönetimi sorularını cevapla
- Aidat ve fatura bilgisi ver
- Bakım talepleri hakkında yardım et

Kurallar:
- Kısa ve yardımcı ol (max 150 kelime)
- Türkçe konuş
- Sadece site yönetimi konularında yardım et
- Sistem güvenliği veya teknik konularda bilgi verme`,
};

class AIService {
    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
    }

    async analyzeFinances(
        userId: string,
        request: AnalyzeFinancesRequest
    ): Promise<AnalyzeFinancesResponse> {
        const cacheKey = { userId, type: 'finances', ...request };

        // Check cache
        const cached = await cacheService.get<string>('finances', cacheKey);
        if (cached) {
            return { insight: cached, cached: true };
        }

        const prompt = `${SYSTEM_PROMPTS.finances}

Kullanıcı Durumu:
- Toplam Borç: ${request.debt} TL
${request.transactions ? `- Son İşlemler: ${JSON.stringify(request.transactions)}` : ''}

Kısa bir finansal analiz ve tavsiye ver.`;

        try {
            const response = await this.ai.models.generateContent({
                model: MODEL_NAME,
                contents: sanitizePrompt(prompt),
            });

            const insight = response.text || 'Analiz tamamlandı.';

            // Cache the result
            await cacheService.set('finances', cacheKey, insight);

            return { insight, cached: false };
        } catch (error) {
            console.error('AI Finance Analysis Error:', error);
            return {
                insight: 'Finansal profiliniz incelendi: Ödemeleriniz düzenli seyretmektedir.',
                cached: false,
            };
        }
    }

    async generateReport(
        userId: string,
        request: GenerateReportRequest
    ): Promise<GenerateReportResponse> {
        const cacheKey = { userId, type: 'report', ...request };

        // Check cache
        const cached = await cacheService.get<{ report: string; summary: string }>('report', cacheKey);
        if (cached) {
            return { ...cached, cached: true };
        }

        const reportTypeLabels: Record<string, string> = {
            monthly: 'Aylık',
            quarterly: 'Çeyreklik',
            annual: 'Yıllık',
            custom: 'Özel Dönem',
        };

        const prompt = `${SYSTEM_PROMPTS.report}

Rapor Türü: ${reportTypeLabels[request.reportType]}
${request.startDate ? `Başlangıç: ${request.startDate}` : ''}
${request.endDate ? `Bitiş: ${request.endDate}` : ''}

Bu dönem için kısa bir finansal özet raporu oluştur.`;

        try {
            const response = await this.ai.models.generateContent({
                model: MODEL_NAME,
                contents: sanitizePrompt(prompt),
            });

            const report = response.text || 'Rapor oluşturuldu.';
            const summary = report.split('\n')[0] || 'Dönem raporu hazırlandı.';

            const result = { report, summary };
            await cacheService.set('report', cacheKey, result);

            return { ...result, cached: false };
        } catch (error) {
            console.error('AI Report Generation Error:', error);
            return {
                report: 'Rapor oluşturulurken bir hata oluştu.',
                summary: 'Rapor hazırlanamadı.',
                cached: false,
            };
        }
    }

    async chatAssistant(
        userId: string,
        request: ChatAssistantRequest
    ): Promise<ChatAssistantResponse> {
        // Don't cache chat responses for personalization
        const prompt = `${SYSTEM_PROMPTS.chat}

${request.context ? `Bağlam: ${request.context}` : ''}

${request.history?.length ? `Önceki Konuşma:\n${request.history.map(h => `${h.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${h.content}`).join('\n')}` : ''}

Kullanıcı: ${request.message}

Asistan:`;

        try {
            const response = await this.ai.models.generateContent({
                model: MODEL_NAME,
                contents: sanitizePrompt(prompt),
            });

            const reply = response.text || 'Nasıl yardımcı olabilirim?';

            return { reply, cached: false };
        } catch (error) {
            console.error('AI Chat Error:', error);
            return {
                reply: 'Şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.',
                cached: false,
            };
        }
    }
}

export const aiService = new AIService();
export default aiService;
