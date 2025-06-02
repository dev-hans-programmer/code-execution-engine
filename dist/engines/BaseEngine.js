"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEngine = void 0;
const child_process_1 = require("child_process");
const logger_1 = require("../utils/logger");
const config_1 = require("../config/config");
class BaseEngine {
    async execute(request) {
        const startTime = Date.now();
        const timeout = Math.min(request.timeout || config_1.config.execution.defaultTimeout, config_1.config.execution.maxTimeout);
        const validation = this.validateCode(request.code);
        if (!validation.isValid) {
            return {
                success: false,
                error: `Security validation failed: ${validation.issues.join(', ')}`,
                executionTime: Date.now() - startTime,
            };
        }
        try {
            const preparedCode = this.prepareCode(request.code, request.input);
            const result = await this.executeCode(preparedCode, timeout);
            return {
                ...result,
                executionTime: Date.now() - startTime,
            };
        }
        catch (error) {
            logger_1.logger.error(`Execution error in ${this.language}`, { error: error.message });
            return {
                success: false,
                error: error.message,
                executionTime: Date.now() - startTime,
            };
        }
    }
    executeCode(code, timeout) {
        return new Promise((resolve) => {
            let output = '';
            let errorOutput = '';
            let isResolved = false;
            const child = (0, child_process_1.spawn)(this.command, this.args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout,
                killSignal: 'SIGKILL',
            });
            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    child.kill('SIGKILL');
                    resolve({
                        success: false,
                        error: `Execution timeout after ${timeout}ms`,
                        executionTime: timeout,
                    });
                }
            }, timeout);
            child.stdout?.on('data', (data) => {
                output += data.toString();
                if (output.length > config_1.config.execution.maxOutputSize) {
                    if (!isResolved) {
                        isResolved = true;
                        clearTimeout(timeoutId);
                        child.kill('SIGKILL');
                        resolve({
                            success: false,
                            error: 'Output size exceeded maximum limit',
                            executionTime: Date.now(),
                        });
                    }
                }
            });
            child.stderr?.on('data', (data) => {
                errorOutput += data.toString();
                if (errorOutput.length > config_1.config.execution.maxOutputSize) {
                    errorOutput = errorOutput.substring(0, config_1.config.execution.maxOutputSize) + '... (truncated)';
                }
            });
            child.on('exit', (code, signal) => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeoutId);
                    if (signal === 'SIGKILL') {
                        resolve({
                            success: false,
                            error: 'Process was killed (timeout or resource limit)',
                            executionTime: timeout,
                        });
                    }
                    else {
                        resolve({
                            success: code === 0,
                            output: output || undefined,
                            error: errorOutput || undefined,
                            exitCode: code || 0,
                            executionTime: Date.now(),
                        });
                    }
                }
            });
            child.on('error', (error) => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeoutId);
                    resolve({
                        success: false,
                        error: `Process error: ${error.message}`,
                        executionTime: Date.now(),
                    });
                }
            });
            try {
                child.stdin?.write(code);
                child.stdin?.end();
            }
            catch (error) {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeoutId);
                    resolve({
                        success: false,
                        error: `Failed to send code to process: ${error.message}`,
                        executionTime: Date.now(),
                    });
                }
            }
        });
    }
}
exports.BaseEngine = BaseEngine;
//# sourceMappingURL=BaseEngine.js.map