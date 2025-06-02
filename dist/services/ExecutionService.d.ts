import { ExecutionRequest, ExecutionResult } from '../types';
export declare class ExecutionService {
    private engines;
    constructor();
    private initializeEngines;
    private setupQueueListeners;
    executeDirectly(request: ExecutionRequest): Promise<ExecutionResult>;
    executeWithQueue(request: ExecutionRequest, priority?: number): Promise<{
        jobId: string;
    }>;
    getSupportedLanguages(): string[];
    getStatus(): {
        supportedLanguages: string[];
        queue: {
            queueSize: number;
            processing: boolean;
            maxQueueSize: number;
        };
    };
}
export declare const executionService: ExecutionService;
//# sourceMappingURL=ExecutionService.d.ts.map