import multer, { File as MulterFile } from 'multer';
import path from 'path';
import fs from 'fs';

declare global {
  namespace Express {
    interface Request {
      files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
    }
  }
}

const ensureFolder = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
};

/**
 * Factory to create multer upload middleware for a dynamic folder
 * @param folderName - The folder name under `uploads/`
 */
export const dynamicUpload = (folderName: string) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), 'uploads', folderName);
      ensureFolder(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
       const safeName = path.basename(file.originalname, ext)
        .replace(/\[/g, '_')
        .replace(/\]/g, '_')
        .replace(/\s+/g, '_')
      const filename = `${Date.now()}-${safeName}${ext}`;
      cb(null, filename);
    },
  });

  const upload = multer({ storage });
  return upload.any();
};

/**
 * Dynamic service upload middleware
 * Accepts: thumbnail (1 file) + media[] (up to 50 files)
 */
export const dynamicServiceUpload = (folderName: string = 'temp') => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), 'uploads', folderName);
      ensureFolder(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    },
  });

  const upload = multer({ storage });
  return upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'media', maxCount: 50 },
  ]);
};
