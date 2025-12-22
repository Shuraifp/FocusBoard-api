import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Task from '../models/Task';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export const getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const categories = await Category.find({ user: authReq.user?._id });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const { name, color } = req.body;

  if (!name) {
    return next(new AppError('Please add a category name', 400));
  }

  const category = await Category.create({
    name,
    color,
    user: authReq.user?._id,
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  if (category.user.toString() !== authReq.user?._id.toString()) {
    return next(new AppError('User not authorized to delete this category', 403));
  }

  await Task.updateMany({ category: category._id }, { category: null });

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
