import { BaseEngine } from './BaseEngine';
export declare class PythonEngine extends BaseEngine {
    readonly language = "python";
    readonly command = "python3";
    readonly args: string[];
    protected validateCode(code: string): {
        isValid: boolean;
        issues: string[];
    };
    protected prepareCode(code: string, input?: string): string;
}
//# sourceMappingURL=PythonEngine.d.ts.map