import { EventEmitter } from 'events';
import { ExecutionRequest } from '../types';
export declare class QueueService extends EventEmitter {
    private queue;
    private processing;
    private jobCounter;
    enqueue(request: ExecutionRequest, priority?: number): Promise<string>;
    getStatus(): {
        queueSize: number;
        processing: boolean;
        maxQueueSize: number;
    };
    private sortQueue;
    private processQueue;
    clear(): number;
    cleanup(maxAge?: number): number;
}
export declare const queueService: QueueService;
//# sourceMappingURL=QueueService.d.ts.map