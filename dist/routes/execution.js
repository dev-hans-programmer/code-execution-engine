"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ExecutionService_1 = require("../services/ExecutionService");
const QueueService_1 = require("../services/QueueService");
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.post('/execute', rateLimiter_1.rateLimiter.middleware, validation_1.validateExecutionRequest, async (req, res) => {
    const startTime = Date.now();
    const executionRequest = req.body;
    try {
        logger_1.logger.info('Code execution request received', {
            language: executionRequest.language,
            codeLength: executionRequest.code.length,
            ip: req.ip,
        });
        const result = await ExecutionService_1.executionService.executeDirectly(executionRequest);
        res.json({
            success: true,
            data: result,
            timestamp: Date.now(),
        });
        logger_1.logger.info('Code execution request completed', {
            language: executionRequest.language,
            success: result.success,
            totalTime: Date.now() - startTime,
            executionTime: result.executionTime,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error('Code execution request failed', {
            language: executionRequest.language,
            error: errorMessage,
            ip: req.ip,
        });
        res.status(500).json({
            success: false,
            error: 'Execution failed',
            message: errorMessage,
            timestamp: Date.now(),
        });
    }
});
router.post('/execute/queue', rateLimiter_1.rateLimiter.middleware, validation_1.validateExecutionRequest, async (req, res) => {
    const executionRequest = req.body;
    const priority = parseInt(req.query.priority) || 1;
    try {
        logger_1.logger.info('Queued execution request received', {
            language: executionRequest.language,
            codeLength: executionRequest.code.length,
            priority,
            ip: req.ip,
        });
        const result = await ExecutionService_1.executionService.executeWithQueue(executionRequest, priority);
        res.json({
            success: true,
            data: result,
            message: 'Code execution queued successfully',
            timestamp: Date.now(),
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error('Queued execution request failed', {
            language: executionRequest.language,
            error: errorMessage,
            ip: req.ip,
        });
        res.status(500).json({
            success: false,
            error: 'Failed to queue execution',
            message: errorMessage,
            timestamp: Date.now(),
        });
    }
});
router.get('/languages', (req, res) => {
    const languages = ExecutionService_1.executionService.getSupportedLanguages();
    res.json({
        success: true,
        data: { languages },
        timestamp: Date.now(),
    });
});
router.get('/status', (req, res) => {
    const status = ExecutionService_1.executionService.getStatus();
    res.json({
        success: true,
        data: status,
        timestamp: Date.now(),
    });
});
router.get('/queue/status', (req, res) => {
    const queueStatus = QueueService_1.queueService.getStatus();
    res.json({
        success: true,
        data: queueStatus,
        timestamp: Date.now(),
    });
});
router.delete('/queue', (req, res) => {
    try {
        const clearedJobs = QueueService_1.queueService.clear();
        logger_1.logger.warn('Queue cleared via API', {
            clearedJobs,
            ip: req.ip,
        });
        res.json({
            success: true,
            data: { clearedJobs },
            message: 'Queue cleared successfully',
            timestamp: Date.now(),
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to clear queue',
            message: error.message,
            timestamp: Date.now(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=execution.js.map