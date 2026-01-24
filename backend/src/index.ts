/**
 * ÅKRONA Backend Server
 * Express.js entry point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config.js';
import aiRoutes from './routes/ai.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const server = app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏢 ÅKRONA AI Proxy Backend                              ║
║   ─────────────────────────────────────                   ║
║   Server running on port ${config.port.toString().padEnd(27)}  ║
║   Environment: ${config.nodeEnv.padEnd(36)}  ║
║                                                           ║
║   Endpoints:                                              ║
║   • POST /api/ai/analyze-finances                         ║
║   • POST /api/ai/generate-report                          ║
║   • POST /api/ai/chat-assistant                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

export default app;
