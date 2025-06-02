import { config } from '../config/config';
import { logger } from './logger';

export class SecurityValidator {
  /**
   * Validates JavaScript code for security issues
   */
  static validateJavaScriptCode(code: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for blocked patterns
    for (const pattern of config.security.blockedPatterns) {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(code)) {
        issues.push(`Blocked pattern detected: ${pattern}`);
      }
    }
    
    // Check for dangerous functions
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
  
  /**
   * Validates Python code for security issues
   */
  static validatePythonCode(code: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for blocked patterns
    for (const pattern of config.security.blockedPatterns) {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(code)) {
        issues.push(`Blocked pattern detected: ${pattern}`);
      }
    }
    
    // Check for dangerous imports and functions
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
  
  /**
   * Sanitizes input to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .substring(0, 10000); // Limit input size
  }
  
  /**
   * Validates execution timeout
   */
  static validateTimeout(timeout: number): number {
    const validTimeout = Math.min(timeout, config.execution.maxTimeout);
    return Math.max(validTimeout, 1000); // Minimum 1 second
  }
  
  /**
   * Logs security violations
   */
  static logSecurityViolation(clientIp: string, violation: string, code: string) {
    logger.warn('Security violation detected', {
      clientIp,
      violation,
      codeSnippet: code.substring(0, 100),
      timestamp: new Date().toISOString()
    });
  }
}
