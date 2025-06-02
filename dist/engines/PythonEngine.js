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
        const indentedCode = code.split('\n').map(line => line.trim() ? '    ' + line : '').join('\n');
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
exports.PythonEngine = PythonEngine;
//# sourceMappingURL=PythonEngine.js.map