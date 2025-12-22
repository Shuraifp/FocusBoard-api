import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task';
import Category from '../models/Category';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export const getTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const match: any = { user: authReq.user?._id };
  const sort: any = {};

  if (req.query.status) {
    match.status = { $in: (req.query.status as string).split(',') };
  }
  if (req.query.priority) {
    match.priority = req.query.priority;
  }
  if (req.query.category) {
    match.category = req.query.category;
  }
  if (req.query['dueDate[gte]'] || req.query['dueDate[lte]']) {
    match.dueDate = {};
    if (req.query['dueDate[gte]']) match.dueDate.$gte = new Date(req.query['dueDate[gte]'] as string);
    if (req.query['dueDate[lte]']) match.dueDate.$lte = new Date(req.query['dueDate[lte]'] as string);
  }

  if (req.query.search) {
    match.$text = { $search: req.query.search as string };
  }
  if (req.query.sortBy) {
    const parts = (req.query.sortBy as string).split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const tasks = await Task.find(match)
    .populate('category', 'name color')
    .limit(limit)
    .skip(skip)
    .sort(sort);

  const count = await Task.countDocuments(match);

  const stats = await Task.aggregate([
    { $match: { user: authReq.user?._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const formattedStats = stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      tasks,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      },
      stats: formattedStats
    }
  });
});

export const getTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const task = await Task.findOne({ _id: req.params.id, user: authReq.user?._id }).populate('category', 'name color');

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { task },
  });
});

export const createTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const { title, category } = req.body;

  if (category) {
    const categoryExists = await Category.findOne({ _id: category, user: authReq.user?._id });
    if (!categoryExists) {
      return next(new AppError('Category not found or invalid', 400));
    }
    await Category.findByIdAndUpdate(category, { $inc: { taskCount: 1 } });
  }

  const task = await Task.create({
    ...req.body,
    user: authReq.user?._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task },
  });
});

export const updateTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  let task = await Task.findOne({ _id: req.params.id, user: authReq.user?._id });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (req.body.category && req.body.category !== task.category?.toString()) {
    if (task.category) {
      await Category.findByIdAndUpdate(task.category, { $inc: { taskCount: -1 } });
    }

    const newCategory = await Category.findOne({ _id: req.body.category, user: authReq.user?._id });
    if (!newCategory) return next(new AppError('New category invalid', 400));

    await Category.findByIdAndUpdate(req.body.category, { $inc: { taskCount: 1 } });
  }

  if (req.body.status) {
    if (!['todo', 'in-progress', 'completed', 'archived'].includes(req.body.status)) {
      return next(new AppError('Invalid status', 400));
    }

    if (req.body.status === 'in-progress' && task.status === 'archived') {
      return next(new AppError('Cannot move archived task to in-progress directly', 400));
    }

    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = new Date();
    }
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Task updated',
    data: { task },
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const task = await Task.findOne({ _id: req.params.id, user: authReq.user?._id });

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  if (task.category) {
    await Category.findByIdAndUpdate(task.category, { $inc: { taskCount: -1 } });
  }

  await task.deleteOne();

  res.status(204).json({ success: true, data: {} });
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const { status } = req.body;

  if (!['todo', 'in-progress', 'completed', 'archived'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const task = await Task.findOne({ _id: req.params.id, user: authReq.user?._id });
  if (!task) return next(new AppError('Task not found', 404));

  if (task.status === 'archived' && status === 'in-progress') {
    return next(new AppError('Cannot move archived task to in-progress directly', 400));
  }

  const updateData: any = { status };
  if (status === 'completed') updateData.completedAt = new Date();

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true });

  res.status(200).json({
    success: true,
    message: 'Task status updated',
    data: { task: updatedTask }
  });
});

export const updateTaskPriority = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const { priority } = req.body;

  if (!['low', 'medium', 'high'].includes(priority)) {
    return next(new AppError('Invalid priority', 400));
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: authReq.user?._id },
    { priority },
    { new: true }
  );
  if (!task) return next(new AppError('Task not found', 404));

  res.status(200).json({
    success: true,
    message: 'Task priority updated',
    data: { task }
  });
});
