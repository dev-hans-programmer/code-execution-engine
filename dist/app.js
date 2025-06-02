"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config/config");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const validation_1 = require("./middleware/validation");
const execution_1 = __importDefault(require("./routes/execution"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.set('trust proxy', 1);
app.use(validation_1.validateContentType);
app.use((req, res, next) => {
    logger_1.logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    next();
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
    });
});
app.use('/api', execution_1.default);
app.get('/', (req, res) => {
    res.json({
        message: 'Code Execution as a Service API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            execute: '/api/execute',
            executeQueue: '/api/execute/queue',
            languages: '/api/languages',
            status: '/api/status',
            queueStatus: '/api/queue/status',
        },
        documentation: 'https://github.com/yourusername/code-execution-service',
    });
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const gracefulShutdown = (signal) => {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
        logger_1.logger.info('HTTP server closed');
        process.exit(0);
    });
    setTimeout(() => {
        logger_1.logger.error('Forceful shutdown after timeout');
        process.exit(1);
    }, 10000);
};
const server = app.listen(config_1.config.port, '0.0.0.0', () => {
    logger_1.logger.info('Code Execution Service started', {
        port: config_1.config.port,
        nodeEnv: config_1.config.nodeEnv,
        pid: process.pid,
    });
});
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=app.js.map