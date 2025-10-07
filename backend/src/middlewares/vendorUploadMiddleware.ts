import { Response, NextFunction } from 'express';
import { dynamicUpload } from '@/services/multer';
import { AuthenticatedRequest } from './authMiddleware';

/**
 * Middleware to handle vendor file uploads dynamically.
 * Folder name is generated as `vendor_<vendorId>` from req.body.vendorId or 'temp'.
 */
export const vendorUploadMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const vendorId = req?.params?.id || req?.userId || 'temp';

  const folderName = `vendor_${vendorId}`;
  const uploadMiddleware = dynamicUpload(folderName);
  uploadMiddleware(req, res, (err: any) => {
    if (err) return next(err);
    next();
  });
};
