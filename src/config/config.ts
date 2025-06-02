import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  },
  
  // Code execution configuration
  execution: {
    defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '5000', 10), // 5 seconds
    maxTimeout: parseInt(process.env.MAX_TIMEOUT || '10000', 10), // 10 seconds
    maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE || '134217728', 10), // 128MB
    maxOutputSize: parseInt(process.env.MAX_OUTPUT_SIZE || '1048576', 10), // 1MB
    maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE || '100', 10),
  },
  
  // Security configuration
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
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
  },
};
