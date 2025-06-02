import { BaseEngine } from './BaseEngine';
import { SecurityValidator } from '../utils/security';

export class JavaScriptEngine extends BaseEngine {
  readonly language = 'javascript';
  readonly command = 'node';
  readonly args = ['-e'];
  
  protected validateCode(code: string): { isValid: boolean; issues: string[] } {
    return SecurityValidator.validateJavaScriptCode(code);
  }
  
  protected prepareCode(code: string, input?: string): string {
    // Create a simpler wrapper that ensures output is captured
    const wrappedCode = `
try {
  // Input handling
  const input = ${JSON.stringify(input || '')};
  let inputLines = input.split('\\n');
  let inputIndex = 0;
  
  // Mock readline for input
  const readline = {
    question: (prompt, callback) => {
      process.stdout.write(prompt);
      const line = inputIndex < inputLines.length ? inputLines[inputIndex++] : '';
      console.log(line);
      callback(line);
    }
  };
  
  // User code
  ${code}
} catch (error) {
  console.error('Runtime Error: ' + error.message);
  process.exit(1);
}
    `;
    
    return wrappedCode;
  }
}
