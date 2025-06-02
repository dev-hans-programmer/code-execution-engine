"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaScriptEngine = void 0;
const BaseEngine_1 = require("./BaseEngine");
const security_1 = require("../utils/security");
class JavaScriptEngine extends BaseEngine_1.BaseEngine {
    constructor() {
        super(...arguments);
        this.language = 'javascript';
        this.command = 'node';
        this.args = ['-e'];
    }
    validateCode(code) {
        return security_1.SecurityValidator.validateJavaScriptCode(code);
    }
    prepareCode(code, input) {
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
exports.JavaScriptEngine = JavaScriptEngine;
//# sourceMappingURL=JavaScriptEngine.js.map