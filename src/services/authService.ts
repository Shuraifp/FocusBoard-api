import jwt, { SignOptions } from 'jsonwebtoken';
import redisClient from '../config/redis';

export const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  } as SignOptions);
};

export const blacklistToken = async (token: string) => {
  try {
    const expirySeconds = 30 * 24 * 60 * 60;
    await redisClient.setEx(`blacklist:${token}`, expirySeconds, '1');
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const result = await redisClient.exists(`blacklist:${token}`);
    return result === 1;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false;
  }
};