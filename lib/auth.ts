import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

export const getCurrentUser = async (): Promise<{ userId: string; email: string } | null> => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    
    const user = session.user as { id?: string; email?: string };
    if (!user.id || !user.email) return null;
    
    return {
      userId: user.id,
      email: user.email,
    };
  } catch {
    return null;
  }
};
