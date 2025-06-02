import { ExecutionRequest, ExecutionResult } from '../types';
import { JavaScriptEngine } from '../engines/JavaScriptEngine';
import { PythonEngine } from '../engines/PythonEngine';
import { BaseEngine } from '../engines/BaseEngine';
import { logger } from '../utils/logger';
import { queueService } from './QueueService';

export class ExecutionService {
  private engines: Map<string, BaseEngine> = new Map();
  
  constructor() {
    this.initializeEngines();
    this.setupQueueListeners();
  }
  
  private initializeEngines() {
    const jsEngine = new JavaScriptEngine();
    const pythonEngine = new PythonEngine();
    
    this.engines.set('javascript', jsEngine);
    this.engines.set('python', pythonEngine);
    
    logger.info('Execution engines initialized', {
      supportedLanguages: Array.from(this.engines.keys()),
    });
  }
  
  private setupQueueListeners() {
    queueService.on('jobStart', async (job) => {
      try {
        const result = await this.executeDirectly(job.request);
        logger.info('Job executed successfully', {
          jobId: job.id,
          success: result.success,
          executionTime: result.executionTime,
        });
      } catch (error) {
        logger.error('Job execution failed', {
          jobId: job.id,
          error: error.message,
        });
      }
    });
  }
  
  /**
   * Executes code directly without queueing
   */
  async executeDirectly(request: ExecutionRequest): Promise<ExecutionResult> {
    const engine = this.engines.get(request.language);
    
    if (!engine) {
      return {
        success: false,
        error: `Unsupported language: ${request.language}`,
        executionTime: 0,
      };
    }
    
    logger.info('Executing code', {
      language: request.language,
      codeLength: request.code.length,
      hasInput: !!request.input,
      timeout: request.timeout,
    });
    
    try {
      const result = await engine.execute(request);
      
      logger.info('Code execution completed', {
        language: request.language,
        success: result.success,
        executionTime: result.executionTime,
        hasOutput: !!result.output,
        hasError: !!result.error,
      });
      
      return result;
    } catch (error) {
      logger.error('Code execution failed', {
        language: request.language,
        error: error.message,
      });
      
      return {
        success: false,
        error: `Execution failed: ${error.message}`,
        executionTime: 0,
      };
    }
  }
  
  /**
   * Executes code with queueing
   */
  async executeWithQueue(request: ExecutionRequest, priority: number = 1): Promise<{ jobId: string }> {
    try {
      const jobId = await queueService.enqueue(request, priority);
      return { jobId };
    } catch (error) {
      throw new Error(`Failed to queue execution: ${error.message}`);
    }
  }
  
  /**
   * Gets supported languages
   */
  getSupportedLanguages(): string[] {
    return Array.from(this.engines.keys());
  }
  
  /**
   * Gets service status
   */
  getStatus() {
    return {
      supportedLanguages: this.getSupportedLanguages(),
      queue: queueService.getStatus(),
    };
  }
}

// Singleton instance
export const executionService = new ExecutionService();
