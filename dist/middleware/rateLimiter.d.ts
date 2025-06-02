import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
declare class RateLimiter {
    private clients;
    private getClientKey;
    private cleanupExpiredEntries;
    middleware: (req: Request, res: Response<ApiResponse>, next: NextFunction) => void;
}
export declare const rateLimiter: RateLimiter;
export {};
//# sourceMappingURL=rateLimiter.d.ts.map