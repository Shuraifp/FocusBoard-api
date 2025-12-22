import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

import { DEFAULT_CATEGORY_COLOR } from '../constants/colors';

export interface ICategory extends Document {
  name: string;
  user: IUser['_id'];
  color?: string;
  taskCount: number;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      trim: true,
      maxlength: [50, 'Category name can not be more than 50 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    color: {
      type: String,
      default: DEFAULT_CATEGORY_COLOR,
    },
    taskCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.model<ICategory>('Category', CategorySchema);
