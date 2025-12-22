import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import taskRoutes from './routes/taskRoutes';
import { errorHandler } from './middleware/errorMiddleware';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Task Management API is running' });
});

app.use(errorHandler);

export default app;
