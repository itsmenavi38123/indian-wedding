import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/env';
import { ApiError } from '@/utils/ApiError';
import { statusCodes } from '@/constant';

export interface AuthenticatedVendorRequest extends Request {
  vendorId?: string;
  vendorEmail?: string;
  vendorName?: string;
  vendorRole?: string;
}

export const authenticateVendor = async (
  req: AuthenticatedVendorRequest,
  res: Response,
  next: NextFunction
) => {
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
      throw new ApiError(statusCodes.UNAUTHORIZED, 'Access token missing');
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      id: string;
      role: string;
      email: string;
      name: string;
    };
    if (decoded.role !== 'VENDOR') {
      throw new ApiError(statusCodes.FORBIDDEN, 'Access denied: Vendor access required');
    }

    // Attach vendor information to request
    req.vendorId = decoded.id;
    req.vendorEmail = decoded.email;
    req.vendorName = decoded.name;
    req.vendorRole = decoded.role;
console.log('Decoded Vendor:', decoded);

    next();
  } catch (error: any) {
    const message =
      error instanceof jwt.TokenExpiredError
        ? 'Token expired'
        : error instanceof jwt.JsonWebTokenError
          ? 'Invalid token'
          : error.message || 'Authentication failed';

    res.status(statusCodes.UNAUTHORIZED).json({
      statusCode: statusCodes.UNAUTHORIZED,
      message,
    });
  }
};
