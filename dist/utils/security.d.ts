export declare class SecurityValidator {
    static validateJavaScriptCode(code: string): {
        isValid: boolean;
        issues: string[];
    };
    static validatePythonCode(code: string): {
        isValid: boolean;
        issues: string[];
    };
    static sanitizeInput(input: string): string;
    static validateTimeout(timeout: number): number;
    static logSecurityViolation(clientIp: string, violation: string, code: string): void;
}
//# sourceMappingURL=security.d.ts.map