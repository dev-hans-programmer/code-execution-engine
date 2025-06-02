import { ExecutionRequest, ExecutionResult } from '../types';
export declare abstract class BaseEngine {
    abstract readonly language: string;
    abstract readonly command: string;
    abstract readonly args: string[];
    protected abstract prepareCode(code: string, input?: string): string;
    protected abstract validateCode(code: string): {
        isValid: boolean;
        issues: string[];
    };
    execute(request: ExecutionRequest): Promise<ExecutionResult>;
    private executeCode;
}
//# sourceMappingURL=BaseEngine.d.ts.map