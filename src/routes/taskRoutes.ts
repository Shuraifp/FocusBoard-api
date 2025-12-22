import express from 'express';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPriority
} from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.put('/:id/status', updateTaskStatus);
router.put('/:id/priority', updateTaskPriority);

export default router;
