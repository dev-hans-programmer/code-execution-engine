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
        this.args = ['--eval'];
    }
    validateCode(code) {
        return security_1.SecurityValidator.validateJavaScriptCode(code);
    }
    prepareCode(code, input) {
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
exports.JavaScriptEngine = JavaScriptEngine;
//# sourceMappingURL=JavaScriptEngine.js.map