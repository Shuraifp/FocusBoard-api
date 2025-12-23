import jwt from 'jsonwebtoken';
import User from '../../src/models/User'
import bcrypt from 'bcrypt';

export const generateAuthToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h',
  });
};

export const createTestUser = async (userData?: {
  username?: string;
  email?: string;
  password?: string;
}) => {
  const hashedPassword = await bcrypt.hash(userData?.password || 'password', 10);
  const user = new User({
    username: userData?.username || 'testuser',
    email: userData?.email || 'testuser@example.com',
    password: hashedPassword,
  });

  await user.save();

  return {
    user,
    token: generateAuthToken(user._id.toString()),
    rawPassword: userData?.password || 'password',
  }
}