"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
    },
    execution: {
        defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '5000', 10),
        maxTimeout: parseInt(process.env.MAX_TIMEOUT || '10000', 10),
        maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE || '134217728', 10),
        maxOutputSize: parseInt(process.env.MAX_OUTPUT_SIZE || '1048576', 10),
        maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE || '100', 10),
    },
    security: {
        allowedJsModules: ['fs', 'path', 'crypto', 'util'],
        allowedPythonModules: ['math', 'random', 'datetime', 'json', 're'],
        blockedPatterns: [
            'require\\s*\\(\\s*["\']child_process["\']',
            'require\\s*\\(\\s*["\']fs["\']',
            'require\\s*\\(\\s*["\']net["\']',
            'require\\s*\\(\\s*["\']http["\']',
            'import\\s+subprocess',
            'import\\s+os',
            'import\\s+sys',
            '__import__',
            'eval\\s*\\(',
            'exec\\s*\\(',
        ],
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    },
};
//# sourceMappingURL=config.js.map