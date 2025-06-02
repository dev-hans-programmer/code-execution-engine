import { EventEmitter } from 'events';
import { QueueJob, ExecutionRequest } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export class QueueService extends EventEmitter {
  private queue: QueueJob[] = [];
  private processing = false;
  private jobCounter = 0;
  
  /**
   * Adds a job to the execution queue
   */
  enqueue(request: ExecutionRequest, priority: number = 1): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= config.execution.maxQueueSize) {
        reject(new Error('Queue is full. Please try again later.'));
        return;
      }
      
      const jobId = `job_${++this.jobCounter}_${Date.now()}`;
      const job: QueueJob = {
        id: jobId,
        request,
        timestamp: Date.now(),
        priority,
      };
      
      this.queue.push(job);
      this.sortQueue();
      
      logger.info('Job enqueued', {
        jobId,
        language: request.language,
        queueSize: this.queue.length,
      });
      
      resolve(jobId);
      
      // Start processing if not already processing
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Gets the current queue status
   */
  getStatus() {
    return {
      queueSize: this.queue.length,
      processing: this.processing,
      maxQueueSize: config.execution.maxQueueSize,
    };
  }
  
  /**
   * Sorts queue by priority (higher priority first) and timestamp
   */
  private sortQueue() {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.timestamp - b.timestamp; // Earlier timestamp first
    });
  }
  
  /**
   * Processes jobs in the queue
   */
  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;
      
      try {
        logger.info('Processing job', {
          jobId: job.id,
          language: job.request.language,
          remainingJobs: this.queue.length,
        });
        
        // Emit job start event
        this.emit('jobStart', job);
        
        // The actual execution will be handled by ExecutionService
        // This is just queue management
        
        // Emit job completion event
        this.emit('jobComplete', job);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Job processing error', {
          jobId: job.id,
          error: errorMessage,
        });
        
        this.emit('jobError', job, error);
      }
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.processing = false;
    logger.info('Queue processing completed');
  }
  
  /**
   * Clears all jobs from the queue
   */
  clear() {
    const clearedCount = this.queue.length;
    this.queue = [];
    logger.info('Queue cleared', { clearedJobs: clearedCount });
    return clearedCount;
  }
  
  /**
   * Removes old jobs from the queue (cleanup)
   */
  cleanup(maxAge: number = 300000) { // 5 minutes default
    const now = Date.now();
    const initialLength = this.queue.length;
    
    this.queue = this.queue.filter(job => now - job.timestamp < maxAge);
    
    const cleanedCount = initialLength - this.queue.length;
    if (cleanedCount > 0) {
      logger.info('Queue cleanup completed', {
        cleanedJobs: cleanedCount,
        remainingJobs: this.queue.length,
      });
    }
    
    return cleanedCount;
  }
}

// Singleton instance
export const queueService = new QueueService();

// Periodic cleanup
setInterval(() => {
  queueService.cleanup();
}, 60000); // Run cleanup every minute
