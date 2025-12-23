import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Redis Client Error', err);
  }
});

redisClient.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Redis Client Connected');
  }
});

export const connectRedis = async () => {
  if (process.env.NODE_ENV === 'test') {
    console.log('⚠️  Skipping Redis connection in test environment');
    return;
  }

  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
};

export default redisClient;