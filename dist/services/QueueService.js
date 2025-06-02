"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueService = exports.QueueService = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const config_1 = require("../config/config");
class QueueService extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.queue = [];
        this.processing = false;
        this.jobCounter = 0;
    }
    enqueue(request, priority = 1) {
        return new Promise((resolve, reject) => {
            if (this.queue.length >= config_1.config.execution.maxQueueSize) {
                reject(new Error('Queue is full. Please try again later.'));
                return;
            }
            const jobId = `job_${++this.jobCounter}_${Date.now()}`;
            const job = {
                id: jobId,
                request,
                timestamp: Date.now(),
                priority,
            };
            this.queue.push(job);
            this.sortQueue();
            logger_1.logger.info('Job enqueued', {
                jobId,
                language: request.language,
                queueSize: this.queue.length,
            });
            resolve(jobId);
            if (!this.processing) {
                this.processQueue();
            }
        });
    }
    getStatus() {
        return {
            queueSize: this.queue.length,
            processing: this.processing,
            maxQueueSize: config_1.config.execution.maxQueueSize,
        };
    }
    sortQueue() {
        this.queue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return a.timestamp - b.timestamp;
        });
    }
    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        this.processing = true;
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            if (!job)
                break;
            try {
                logger_1.logger.info('Processing job', {
                    jobId: job.id,
                    language: job.request.language,
                    remainingJobs: this.queue.length,
                });
                this.emit('jobStart', job);
                this.emit('jobComplete', job);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger_1.logger.error('Job processing error', {
                    jobId: job.id,
                    error: errorMessage,
                });
                this.emit('jobError', job, error);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.processing = false;
        logger_1.logger.info('Queue processing completed');
    }
    clear() {
        const clearedCount = this.queue.length;
        this.queue = [];
        logger_1.logger.info('Queue cleared', { clearedJobs: clearedCount });
        return clearedCount;
    }
    cleanup(maxAge = 300000) {
        const now = Date.now();
        const initialLength = this.queue.length;
        this.queue = this.queue.filter(job => now - job.timestamp < maxAge);
        const cleanedCount = initialLength - this.queue.length;
        if (cleanedCount > 0) {
            logger_1.logger.info('Queue cleanup completed', {
                cleanedJobs: cleanedCount,
                remainingJobs: this.queue.length,
            });
        }
        return cleanedCount;
    }
}
exports.QueueService = QueueService;
exports.queueService = new QueueService();
setInterval(() => {
    exports.queueService.cleanup();
}, 60000);
//# sourceMappingURL=QueueService.js.map