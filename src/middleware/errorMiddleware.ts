import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: err.message,
      details: err.details,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};
