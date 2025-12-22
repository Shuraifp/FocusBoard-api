import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { ICategory } from './Category';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category: ICategory['_id'] | null;
  user: IUser['_id'];
  tags?: string[];
  estimatedHours?: number;
  completedAt?: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed', 'archived'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [String],
    estimatedHours: Number,
    completedAt: Date
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ITask>('Task', TaskSchema);
