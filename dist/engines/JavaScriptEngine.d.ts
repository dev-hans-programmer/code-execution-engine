import { BaseEngine } from './BaseEngine';
export declare class JavaScriptEngine extends BaseEngine {
    readonly language = "javascript";
    readonly command = "node";
    readonly args: string[];
    protected validateCode(code: string): {
        isValid: boolean;
        issues: string[];
    };
    protected prepareCode(code: string, input?: string): string;
}
//# sourceMappingURL=JavaScriptEngine.d.ts.map