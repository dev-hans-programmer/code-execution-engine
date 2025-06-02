export declare const config: {
    port: number;
    nodeEnv: string;
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    execution: {
        defaultTimeout: number;
        maxTimeout: number;
        maxMemoryUsage: number;
        maxOutputSize: number;
        maxQueueSize: number;
    };
    security: {
        allowedJsModules: string[];
        allowedPythonModules: string[];
        blockedPatterns: string[];
    };
    logging: {
        level: string;
        enableFileLogging: boolean;
    };
};
//# sourceMappingURL=config.d.ts.map