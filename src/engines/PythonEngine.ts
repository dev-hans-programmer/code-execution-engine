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
    // Wrap the user code in a secure execution environment
    const wrappedCode = `
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

# Disable dangerous modules
sys.modules['subprocess'] = None
sys.modules['os'] = None
sys.modules['socket'] = None
sys.modules['urllib'] = None
sys.modules['http'] = None

# Mock input function
input_data = ${JSON.stringify(input || '')}
input_lines = input_data.split('\\n') if input_data else []
input_index = 0

def mock_input(prompt=''):
    global input_index
    if prompt:
        print(prompt, end='')
    if input_index < len(input_lines):
        result = input_lines[input_index]
        input_index += 1
        print(result)
        return result
    return ''

# Replace built-in input
__builtins__['input'] = mock_input

# Capture output
stdout_capture = io.StringIO()
stderr_capture = io.StringIO()

try:
    with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
        # User code execution
${code}
    
    # Print captured output
    stdout_content = stdout_capture.getvalue()
    stderr_content = stderr_capture.getvalue()
    
    if stdout_content:
        print(stdout_content, end='')
    if stderr_content:
        print(f"Error: {stderr_content}", file=sys.stderr, end='')
        
except Exception as e:
    print(f"Runtime Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;
    
    return wrappedCode;
  }
}
