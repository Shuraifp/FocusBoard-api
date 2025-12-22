import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from './asyncHandler';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  const authReq = req as AuthRequest;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const { isTokenBlacklisted } = await import('../services/authService');
      const blacklisted = await isTokenBlacklisted(token);

      if (blacklisted) {
        return next(new AppError('Token has been revoked', 401));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new AppError('Not authorized, user not found', 401));
      }

      authReq.user = user;
      next();
    } catch (error) {
      return next(new AppError('Not authorized, token failed', 401));
    }
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }
});
