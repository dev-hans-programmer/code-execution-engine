import { BaseEngine } from './BaseEngine';
import { SecurityValidator } from '../utils/security';

export class JavaScriptEngine extends BaseEngine {
  readonly language = 'javascript';
  readonly command = 'node';
  readonly args = ['--eval'];
  
  protected validateCode(code: string): { isValid: boolean; issues: string[] } {
    return SecurityValidator.validateJavaScriptCode(code);
  }
  
  protected prepareCode(code: string, input?: string): string {
    // Wrap the user code in a secure execution environment
    const wrappedCode = `
      // Disable dangerous globals
      delete require;
      delete process;
      delete global;
      delete Buffer;
      delete setImmediate;
      delete clearImmediate;
      
      // Mock console for output capture
      let capturedOutput = [];
      const originalConsole = {
        log: (...args) => capturedOutput.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')),
        error: (...args) => capturedOutput.push('ERROR: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')),
        warn: (...args) => capturedOutput.push('WARN: ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')),
      };
      
      console = originalConsole;
      
      // Input handling
      const input = ${JSON.stringify(input || '')};
      const readline = {
        question: (prompt, callback) => {
          console.log(prompt);
          callback(input);
        }
      };
      
      try {
        // User code execution
        ${code}
        
        // Output results
        if (capturedOutput.length > 0) {
          console.log(capturedOutput.join('\\n'));
        }
      } catch (error) {
        console.error('Runtime Error: ' + error.message);
        process.exit(1);
      }
    `;
    
    return wrappedCode;
  }
}
