import { spawn, ChildProcess } from 'child_process';
import { ExecutionRequest, ExecutionResult } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export abstract class BaseEngine {
  abstract readonly language: string;
  abstract readonly command: string;
  abstract readonly args: string[];
  
  protected abstract prepareCode(code: string, input?: string): string;
  protected abstract validateCode(code: string): { isValid: boolean; issues: string[] };
  
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timeout = Math.min(request.timeout || config.execution.defaultTimeout, config.execution.maxTimeout);
    
    // Validate code first
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Execution error in ${this.language}`, { error: errorMessage });
      return {
        success: false,
        error: errorMessage,
        executionTime: Date.now() - startTime,
      };
    }
  }
  
  private executeCode(code: string, timeout: number): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      let output = '';
      let errorOutput = '';
      let isResolved = false;
      
      const child: ChildProcess = spawn(this.command, this.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout,
        killSignal: 'SIGKILL',
      });
      
      // Set up timeout
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
      
      // Handle stdout
      child.stdout?.on('data', (data) => {
        output += data.toString();
        if (output.length > config.execution.maxOutputSize) {
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
      
      // Handle stderr
      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
        if (errorOutput.length > config.execution.maxOutputSize) {
          errorOutput = errorOutput.substring(0, config.execution.maxOutputSize) + '... (truncated)';
        }
      });
      
      // Handle process exit
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
          } else {
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
      
      // Handle errors
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
      
      // Send code to stdin
      try {
        child.stdin?.write(code);
        child.stdin?.end();
      } catch (error) {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          resolve({
            success: false,
            error: `Failed to send code to process: ${errorMessage}`,
            executionTime: Date.now(),
          });
        }
      }
    });
  }
}
