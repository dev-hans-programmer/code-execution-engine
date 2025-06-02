import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { ApiResponse, RateLimitInfo } from '../types';
import { logger } from '../utils/logger';

class RateLimiter {
  private clients: Map<string, RateLimitInfo> = new Map();
  
  private getClientKey(req: Request): string {
    // Use IP address and user agent for basic client identification
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    return `${ip}:${userAgent.substring(0, 50)}`;
  }
  
  private cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, info] of this.clients.entries()) {
      if (now > info.resetTime) {
        this.clients.delete(key);
      }
    }
  }
  
  public middleware = (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    const clientKey = this.getClientKey(req);
    const now = Date.now();
    
    // Cleanup expired entries periodically
    if (Math.random() < 0.1) { // 10% chance
      this.cleanupExpiredEntries();
    }
    
    let clientInfo = this.clients.get(clientKey);
    
    if (!clientInfo || now > clientInfo.resetTime) {
      // Reset or create new rate limit info
      clientInfo = {
        count: 0,
        resetTime: now + config.rateLimit.windowMs,
      };
      this.clients.set(clientKey, clientInfo);
    }
    
    clientInfo.count++;
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': config.rateLimit.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(
        0,
        config.rateLimit.maxRequests - clientInfo.count
      ).toString(),
      'X-RateLimit-Reset': Math.ceil(clientInfo.resetTime / 1000).toString(),
    });
    
    if (clientInfo.count > config.rateLimit.maxRequests) {
      logger.warn('Rate limit exceeded', {
        clientKey,
        count: clientInfo.count,
        limit: config.rateLimit.maxRequests,
      });
      
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${config.rateLimit.maxRequests} per ${config.rateLimit.windowMs / 1000} seconds`,
        timestamp: now,
      });
      return;
    }
    
    next();
  };
}

export const rateLimiter = new RateLimiter();
