"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityValidator = void 0;
const config_1 = require("../config/config");
const logger_1 = require("./logger");
class SecurityValidator {
    static validateJavaScriptCode(code) {
        const issues = [];
        for (const pattern of config_1.config.security.blockedPatterns) {
            const regex = new RegExp(pattern, 'gi');
            if (regex.test(code)) {
                issues.push(`Blocked pattern detected: ${pattern}`);
            }
        }
        const dangerousFunctions = [
            'setTimeout', 'setInterval', 'setImmediate',
            'process.exit', 'process.kill',
            'Buffer.allocUnsafe'
        ];
        for (const func of dangerousFunctions) {
            if (code.includes(func)) {
                issues.push(`Dangerous function detected: ${func}`);
            }
        }
        return {
            isValid: issues.length === 0,
            issues
        };
    }
    static validatePythonCode(code) {
        const issues = [];
        for (const pattern of config_1.config.security.blockedPatterns) {
            const regex = new RegExp(pattern, 'gi');
            if (regex.test(code)) {
                issues.push(`Blocked pattern detected: ${pattern}`);
            }
        }
        const dangerousPatterns = [
            'import\\s+subprocess',
            'import\\s+os',
            'import\\s+sys',
            'from\\s+subprocess',
            'from\\s+os',
            'from\\s+sys',
            '__import__',
            'open\\s*\\(',
            'compile\\s*\\(',
        ];
        for (const pattern of dangerousPatterns) {
            const regex = new RegExp(pattern, 'gi');
            if (regex.test(code)) {
                issues.push(`Dangerous pattern detected: ${pattern}`);
            }
        }
        return {
            isValid: issues.length === 0,
            issues
        };
    }
    static sanitizeInput(input) {
        return input
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            .substring(0, 10000);
    }
    static validateTimeout(timeout) {
        const validTimeout = Math.min(timeout, config_1.config.execution.maxTimeout);
        return Math.max(validTimeout, 1000);
    }
    static logSecurityViolation(clientIp, violation, code) {
        logger_1.logger.warn('Security violation detected', {
            clientIp,
            violation,
            codeSnippet: code.substring(0, 100),
            timestamp: new Date().toISOString()
        });
    }
}
exports.SecurityValidator = SecurityValidator;
//# sourceMappingURL=security.js.map