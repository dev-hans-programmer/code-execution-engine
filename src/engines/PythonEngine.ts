import { BaseEngine } from './BaseEngine';
import { SecurityValidator } from '../utils/security';

export class PythonEngine extends BaseEngine {
  readonly language = 'python';
  readonly command = 'python3';
  readonly args = ['-c'];
  
  protected validateCode(code: string): { isValid: boolean; issues: string[] } {
    return SecurityValidator.validatePythonCode(code);
  }
  
  protected prepareCode(code: string, input?: string): string {
    // Indent user code properly
    const indentedCode = code.split('\n').map(line => line.trim() ? '    ' + line : '').join('\n');
    
    // Create a simple Python wrapper
    const wrappedCode = `import sys

# Simple input handling
input_data = ${JSON.stringify(input || '')}
input_lines = input_data.split('\\n') if input_data else []
input_index = 0

def input(prompt=''):
    global input_index
    if prompt:
        print(prompt, end='', flush=True)
    if input_index < len(input_lines):
        result = input_lines[input_index]
        input_index += 1
        print(result)
        return result
    return ''

try:
${indentedCode}
except Exception as e:
    print(f"Runtime Error: {str(e)}", file=sys.stderr)
    sys.exit(1)`;
    
    return wrappedCode;
  }
}
