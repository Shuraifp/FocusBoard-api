import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/asyncHandler';
import { generateToken } from '../services/authService';
import { AUTH_MESSAGES } from '../constants/messages';

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError(AUTH_MESSAGES.MISSING_FIELDS, 400));
  }

  if (password.length < 6 || !/\d/.test(password)) {
    return next(new AppError(AUTH_MESSAGES.WEAK_PASSWORD, 400));
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return next(new AppError(AUTH_MESSAGES.USER_ALREADY_EXISTS, 409));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: AUTH_MESSAGES.REGISTRATION_SUCCESS,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        tokens: {
          accessToken: generateToken(String(user._id)),
          expiresIn: 3600
        },
      },
    });
  } else {
    return next(new AppError(AUTH_MESSAGES.INVALID_USER_DATA, 400));
  }
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(AUTH_MESSAGES.MISSING_EMAIL_PASSWORD, 400));
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        tokens: {
          accessToken: generateToken(String(user._id)),
          expiresIn: 3600
        },
      },
    });
  } else {
    return next(new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401));
  }
});

export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    return next(new AppError(AUTH_MESSAGES.USER_NOT_FOUND, 404));
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as any;
  const token = authReq.headers.authorization?.split(' ')[1];

  if (token) {
    const { blacklistToken } = await import('../services/authService');
    await blacklistToken(token);
  }

  res.status(200).json({
    success: true,
    message: AUTH_MESSAGES.LOGOUT_SUCCESS,
    data: {}
  });
});
