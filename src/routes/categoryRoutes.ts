import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .delete(deleteCategory);

export default router;
