import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/env';
import { ApiError } from '@/utils/ApiError';
import { UserRole } from '@prisma/client';
import prisma from '@/config/prisma';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: UserRole;
  userEmail?: string;
  userName?: string;
}

export const authenticate =
  (allowedRoles: UserRole[] = []) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
      if (!token && req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }
      if (!token) {
        throw new ApiError(401, 'Access token missing');
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        id: string;
        role: UserRole;
        email: string;
        name: string;
      };
      req.userId = decoded.id;
      req.userRole = decoded.role;
      req.userEmail = decoded.email;
      req.userName = decoded.name;
      let userExists = false;

      if (decoded.role === 'ADMIN') {
        userExists = !!(await prisma.admin.findUnique({
          where: { id: decoded.id },
          select: { id: true },
        }));
      } else if (decoded.role === 'VENDOR') {
        userExists = !!(await prisma.vendor.findUnique({
          where: { id: decoded.id },
          select: { id: true },
        }));
      } else if (decoded.role === 'USER') {
        userExists = !!(await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true },
        }));
      }
      if (!userExists) {
        throw new ApiError(403, 'User not found');
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        throw new ApiError(403, 'Access denied: Insufficient permissions');
      }

      next();
    } catch (error: any) {
      const message =
        error instanceof jwt.TokenExpiredError
          ? 'Token expired'
          : error instanceof jwt.JsonWebTokenError
            ? 'Invalid token'
            : error.message || 'Authentication failed';

      res.status(401).json({ statusCode: 401, message });
    }
  };

export const authenticateMiddleware =
  () => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
      if (!token && req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }
      if (token) {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
          id: string;
          role: UserRole;
          email: string;
          name: string;
        };
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.userEmail = decoded.email;
        req.userName = decoded.name;
        let userExists = false;
        if (decoded.role === 'ADMIN') {
          userExists = !!(await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: { id: true },
          }));
        } else if (decoded.role === 'VENDOR') {
          userExists = !!(await prisma.vendor.findUnique({
            where: { id: decoded.id },
            select: { id: true },
          }));
        } else if (decoded.role === 'USER') {
          userExists = !!(await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true },
          }));
        }
        if (!userExists) {
          throw new ApiError(403, 'User not found');
        }
      }
      next();
    } catch (error: any) {
      const message =
        error instanceof jwt.TokenExpiredError
          ? 'Token expired'
          : error instanceof jwt.JsonWebTokenError
            ? 'Invalid token'
            : error.message || 'Authentication failed';

      res.status(401).json({ statusCode: 401, message });
    }
  };
