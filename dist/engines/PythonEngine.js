"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonEngine = void 0;
const BaseEngine_1 = require("./BaseEngine");
const security_1 = require("../utils/security");
class PythonEngine extends BaseEngine_1.BaseEngine {
    constructor() {
        super(...arguments);
        this.language = 'python';
        this.command = 'python3';
        this.args = ['-c'];
    }
    validateCode(code) {
        return security_1.SecurityValidator.validatePythonCode(code);
    }
    prepareCode(code, input) {
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
exports.PythonEngine = PythonEngine;
//# sourceMappingURL=PythonEngine.js.map