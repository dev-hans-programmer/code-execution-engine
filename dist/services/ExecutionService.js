"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executionService = exports.ExecutionService = void 0;
const JavaScriptEngine_1 = require("../engines/JavaScriptEngine");
const PythonEngine_1 = require("../engines/PythonEngine");
const logger_1 = require("../utils/logger");
const QueueService_1 = require("./QueueService");
class ExecutionService {
    constructor() {
        this.engines = new Map();
        this.initializeEngines();
        this.setupQueueListeners();
    }
    initializeEngines() {
        const jsEngine = new JavaScriptEngine_1.JavaScriptEngine();
        const pythonEngine = new PythonEngine_1.PythonEngine();
        this.engines.set('javascript', jsEngine);
        this.engines.set('python', pythonEngine);
        logger_1.logger.info('Execution engines initialized', {
            supportedLanguages: Array.from(this.engines.keys()),
        });
    }
    setupQueueListeners() {
        QueueService_1.queueService.on('jobStart', async (job) => {
            try {
                const result = await this.executeDirectly(job.request);
                logger_1.logger.info('Job executed successfully', {
                    jobId: job.id,
                    success: result.success,
                    executionTime: result.executionTime,
                });
            }
            catch (error) {
                logger_1.logger.error('Job execution failed', {
                    jobId: job.id,
                    error: error.message,
                });
            }
        });
    }
    async executeDirectly(request) {
        const engine = this.engines.get(request.language);
        if (!engine) {
            return {
                success: false,
                error: `Unsupported language: ${request.language}`,
                executionTime: 0,
            };
        }
        logger_1.logger.info('Executing code', {
            language: request.language,
            codeLength: request.code.length,
            hasInput: !!request.input,
            timeout: request.timeout,
        });
        try {
            const result = await engine.execute(request);
            logger_1.logger.info('Code execution completed', {
                language: request.language,
                success: result.success,
                executionTime: result.executionTime,
                hasOutput: !!result.output,
                hasError: !!result.error,
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Code execution failed', {
                language: request.language,
                error: error.message,
            });
            return {
                success: false,
                error: `Execution failed: ${error.message}`,
                executionTime: 0,
            };
        }
    }
    async executeWithQueue(request, priority = 1) {
        try {
            const jobId = await QueueService_1.queueService.enqueue(request, priority);
            return { jobId };
        }
        catch (error) {
            throw new Error(`Failed to queue execution: ${error.message}`);
        }
    }
    getSupportedLanguages() {
        return Array.from(this.engines.keys());
    }
    getStatus() {
        return {
            supportedLanguages: this.getSupportedLanguages(),
            queue: QueueService_1.queueService.getStatus(),
        };
    }
}
exports.ExecutionService = ExecutionService;
exports.executionService = new ExecutionService();
//# sourceMappingURL=ExecutionService.js.map