import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

const executionSchema = Joi.object({
  language: Joi.string().valid('javascript', 'python').required(),
  code: Joi.string().min(1).max(100000).required(),
  input: Joi.string().max(10000).optional(),
  timeout: Joi.number().integer().min(1000).max(10000).optional(),
});

export const validateExecutionRequest = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const { error, value } = executionSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: error.details[0].message,
      timestamp: Date.now(),
    });
    return;
  }
  
  // Sanitize and normalize the validated data
  req.body = {
    language: value.language,
    code: value.code.trim(),
    input: value.input ? value.input.trim() : '',
    timeout: value.timeout || 5000,
  };
  
  next();
};

export const validateContentType = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  if (req.method !== 'GET' && !req.is('application/json')) {
    res.status(400).json({
      success: false,
      error: 'Invalid content type',
      message: 'Content-Type must be application/json',
      timestamp: Date.now(),
    });
    return;
  }
  
  next();
};
