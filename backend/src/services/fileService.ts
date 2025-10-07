import fs from 'fs';
import path from 'path';

export const deleteFile = (filePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!filePath) {
      console.warn('⚠️ deleteFile called with empty filePath');
      resolve(false);
      return;
    }

    try {
      // Handle both relative and absolute paths
      let absolutePath: string;

      if (filePath.startsWith('/uploads/')) {
        // Remove leading slash and join with process.cwd()
        absolutePath = path.join(process.cwd(), filePath.slice(1));
      } else if (filePath.startsWith('uploads/')) {
        // Already relative path
        absolutePath = path.join(process.cwd(), filePath);
      } else if (path.isAbsolute(filePath)) {
        // Already absolute path
        absolutePath = filePath;
      } else {
        // Treat as relative path from project root
        absolutePath = path.join(process.cwd(), filePath);
      }

      console.log('🗑 Attempting to delete file:', absolutePath);

      // Check if file exists first
      if (!fs.existsSync(absolutePath)) {
        console.warn('⚠️ File not found, cannot delete:', absolutePath);
        resolve(false);
        return;
      }

      // Delete file asynchronously
      fs.unlink(absolutePath, (err) => {
        if (err) {
          console.error('❌ Error deleting file:', absolutePath, err.message);
          resolve(false);
        } else {
          console.log('✅ File deleted successfully:', absolutePath);
          resolve(true);
        }
      });
    } catch (error) {
      console.error('❌ Unexpected error in deleteFile:', error);
      resolve(false);
    }
  });
};

// Synchronous version if needed
export const deleteFileSync = (filePath: string): boolean => {
  if (!filePath) {
    console.warn('⚠️ deleteFileSync called with empty filePath');
    return false;
  }

  try {
    let absolutePath: string;

    if (filePath.startsWith('/uploads/')) {
      absolutePath = path.join(process.cwd(), filePath.slice(1));
    } else if (filePath.startsWith('uploads/')) {
      absolutePath = path.join(process.cwd(), filePath);
    } else if (path.isAbsolute(filePath)) {
      absolutePath = filePath;
    } else {
      absolutePath = path.join(process.cwd(), filePath);
    }

    console.log('🗑 Attempting to delete file (sync):', absolutePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn('⚠️ File not found, cannot delete:', absolutePath);
      return false;
    }

    fs.unlinkSync(absolutePath);
    console.log('✅ File deleted successfully (sync):', absolutePath);
    return true;
  } catch (error) {
    console.error('❌ Error deleting file (sync):', filePath, error);
    return false;
  }
};
