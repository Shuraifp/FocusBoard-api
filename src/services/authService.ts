import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  } as SignOptions);
};
