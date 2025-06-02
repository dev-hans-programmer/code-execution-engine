export interface ExecutionRequest {
  language: 'javascript' | 'python';
  code: string;
  input?: string;
  timeout?: number;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
  exitCode?: number;
}

export interface QueueJob {
  id: string;
  request: ExecutionRequest;
  timestamp: number;
  priority: number;
}

export interface RateLimitInfo {
  count: number;
  resetTime: number;
}

export interface SecurityConfig {
  maxExecutionTime: number;
  maxMemoryUsage: number;
  maxOutputSize: number;
  allowedModules: string[];
  blockedPatterns: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}
