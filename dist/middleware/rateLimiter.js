"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
class RateLimiter {
    constructor() {
        this.clients = new Map();
        this.middleware = (req, res, next) => {
            const clientKey = this.getClientKey(req);
            const now = Date.now();
            if (Math.random() < 0.1) {
                this.cleanupExpiredEntries();
            }
            let clientInfo = this.clients.get(clientKey);
            if (!clientInfo || now > clientInfo.resetTime) {
                clientInfo = {
                    count: 0,
                    resetTime: now + config_1.config.rateLimit.windowMs,
                };
                this.clients.set(clientKey, clientInfo);
            }
            clientInfo.count++;
            res.set({
                'X-RateLimit-Limit': config_1.config.rateLimit.maxRequests.toString(),
                'X-RateLimit-Remaining': Math.max(0, config_1.config.rateLimit.maxRequests - clientInfo.count).toString(),
                'X-RateLimit-Reset': Math.ceil(clientInfo.resetTime / 1000).toString(),
            });
            if (clientInfo.count > config_1.config.rateLimit.maxRequests) {
                logger_1.logger.warn('Rate limit exceeded', {
                    clientKey,
                    count: clientInfo.count,
                    limit: config_1.config.rateLimit.maxRequests,
                });
                res.status(429).json({
                    success: false,
                    error: 'Rate limit exceeded',
                    message: `Too many requests. Limit: ${config_1.config.rateLimit.maxRequests} per ${config_1.config.rateLimit.windowMs / 1000} seconds`,
                    timestamp: now,
                });
                return;
            }
            next();
        };
    }
    getClientKey(req) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        return `${ip}:${userAgent.substring(0, 50)}`;
    }
    cleanupExpiredEntries() {
        const now = Date.now();
        for (const [key, info] of this.clients.entries()) {
            if (now > info.resetTime) {
                this.clients.delete(key);
            }
        }
    }
}
exports.rateLimiter = new RateLimiter();
//# sourceMappingURL=rateLimiter.js.map