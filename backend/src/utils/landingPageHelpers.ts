import { File as MulterFile } from 'multer';
import fs from 'fs';
import path from 'path';

export async function handleUploads(files: MulterFile[], sectionKey: string) {
  const uploadedFiles: MulterFile[] = Array.isArray(files) ? files : Object.values(files).flat();
  const sectionDir = path.join(process.cwd(), 'uploads', 'landingpage', sectionKey);

  if (!fs.existsSync(sectionDir)) await fs.promises.mkdir(sectionDir, { recursive: true });

  const mediaFiles: Record<string, string> = {};
  for (const file of uploadedFiles) {
    const newPath = path.join(sectionDir, file.filename);
    await fs.promises.rename(file.path, newPath);

    const match = file.fieldname.match(/cards\[(\d+)\]\[image\]/);
    if (match) {
      const idx = match[1];
      mediaFiles[`card${idx}`] = `/uploads/landingpage/${sectionKey}/${file.filename}`;
    } else {
      mediaFiles[file.fieldname] = `/uploads/landingpage/${sectionKey}/${file.filename}`;
    }
  }
  return mediaFiles;
}
