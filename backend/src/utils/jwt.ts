import jwt from 'jsonwebtoken';
import { env } from '@/env';

export function generateAccessToken(payload: any): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    // expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    expiresIn: '1d',
  });
}

export function generateRefreshToken(userId: string, rememberMe: boolean = false): string {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET as string, {
    // expiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
    expiresIn: rememberMe ? '30d' : '1d',
  });
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}
