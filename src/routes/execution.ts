import { Router, Request, Response } from 'express';
import { executionService } from '../services/ExecutionService';
import { queueService } from '../services/QueueService';
import { validateExecutionRequest } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiter';
import { ExecutionRequest, ApiResponse, ExecutionResult } from '../types';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Execute code directly
 * POST /api/execute
 */
router.post(
  '/execute',
  rateLimiter.middleware,
  validateExecutionRequest,
  async (req: Request, res: Response<ApiResponse<ExecutionResult>>) => {
    const startTime = Date.now();
    const executionRequest: ExecutionRequest = req.body;
    
    try {
      logger.info('Code execution request received', {
        language: executionRequest.language,
        codeLength: executionRequest.code.length,
        ip: req.ip,
      });
      
      const result = await executionService.executeDirectly(executionRequest);
      
      res.json({
        success: true,
        data: result,
        timestamp: Date.now(),
      });
      
      logger.info('Code execution request completed', {
        language: executionRequest.language,
        success: result.success,
        totalTime: Date.now() - startTime,
        executionTime: result.executionTime,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Code execution request failed', {
        language: executionRequest.language,
        error: errorMessage,
        ip: req.ip,
      });
      
      res.status(500).json({
        success: false,
        error: 'Execution failed',
        message: errorMessage,
        timestamp: Date.now(),
      });
    }
  }
);

/**
 * Execute code with queueing
 * POST /api/execute/queue
 */
router.post(
  '/execute/queue',
  rateLimiter.middleware,
  validateExecutionRequest,
  async (req: Request, res: Response<ApiResponse<{ jobId: string }>>) => {
    const executionRequest: ExecutionRequest = req.body;
    const priority = parseInt(req.query.priority as string) || 1;
    
    try {
      logger.info('Queued execution request received', {
        language: executionRequest.language,
        codeLength: executionRequest.code.length,
        priority,
        ip: req.ip,
      });
      
      const result = await executionService.executeWithQueue(executionRequest, priority);
      
      res.json({
        success: true,
        data: result,
        message: 'Code execution queued successfully',
        timestamp: Date.now(),
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Queued execution request failed', {
        language: executionRequest.language,
        error: errorMessage,
        ip: req.ip,
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to queue execution',
        message: errorMessage,
        timestamp: Date.now(),
      });
    }
  }
);

/**
 * Get supported languages
 * GET /api/languages
 */
router.get('/languages', (req: Request, res: Response<ApiResponse<{ languages: string[] }>>) => {
  const languages = executionService.getSupportedLanguages();
  
  res.json({
    success: true,
    data: { languages },
    timestamp: Date.now(),
  });
});

/**
 * Get service status
 * GET /api/status
 */
router.get('/status', (req: Request, res: Response<ApiResponse>) => {
  const status = executionService.getStatus();
  
  res.json({
    success: true,
    data: status,
    timestamp: Date.now(),
  });
});

/**
 * Get queue status
 * GET /api/queue/status
 */
router.get('/queue/status', (req: Request, res: Response<ApiResponse>) => {
  const queueStatus = queueService.getStatus();
  
  res.json({
    success: true,
    data: queueStatus,
    timestamp: Date.now(),
  });
});

/**
 * Clear queue (admin endpoint)
 * DELETE /api/queue
 */
router.delete('/queue', (req: Request, res: Response<ApiResponse<{ clearedJobs: number }>>) => {
  try {
    const clearedJobs = queueService.clear();
    
    logger.warn('Queue cleared via API', {
      clearedJobs,
      ip: req.ip,
    });
    
    res.json({
      success: true,
      data: { clearedJobs },
      message: 'Queue cleared successfully',
      timestamp: Date.now(),
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: 'Failed to clear queue',
      message: errorMessage,
      timestamp: Date.now(),
    });
  }
});

export default router;
