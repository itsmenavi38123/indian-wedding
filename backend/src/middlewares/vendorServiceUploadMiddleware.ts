import { Response, NextFunction } from 'express';
import { dynamicServiceUpload, dynamicUpload } from '@/services/multer';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware to handle vendor file uploads dynamically.
 * Folder name is generated as `vendor_<vendorId>` from req.body.vendorId or 'temp'.
 */
export const vendorServiceUploadMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const uploadMiddleware = dynamicServiceUpload('temp');
  uploadMiddleware(req, res, (err: any) => {
    if (err) return next(err);
    next();
  });
};
