import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/asyncHandler';
import { generateToken } from '../services/authService';

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new AppError('Please provide all fields', 400));
  }

  // Password validation: Min 6 chars, at least one number
  if (password.length < 6 || !/\d/.test(password)) {
    return next(new AppError('Password must be at least 6 characters and contain a number', 400));
  }

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return next(new AppError('User already exists', 409));
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
      message: 'Registration successful',
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
    return next(new AppError('Invalid user data', 400));
  }
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
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
    return next(new AppError('Invalid credentials', 401));
  }
});

export const getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    return next(new AppError('User not found', 404));
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

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Since we are using stateless JWT, we can't really "logout" on server without a database blacklist.
  // However, for the purpose of the API requirement, we return success.
  // The client should remove the token.

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {}
  });
});
