import { dynamicUpload } from '@/services/multer';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const landingpageUploadMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const uploadMiddleware = dynamicUpload('landingpage');
  uploadMiddleware(req, res, (err: any) => {
    if (err) return next(err);
    next();
  });
};
