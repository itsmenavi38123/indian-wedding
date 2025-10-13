import { Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
import { statusCodes, errorMessages, successMessages } from '@/constant';
import { vendorServiceSchema } from '@/validators/services/services';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import { deleteFile } from '@/services/fileService';
import { File as MulterFile } from 'multer';
import path from 'path';
import fs from 'fs';
import { MediaType } from '@prisma/client';
import { AuthenticatedVendorRequest } from '@/middlewares/vendorAuthMiddleware';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

type MovedFile = {
  path: string;
  fieldname: string;
  url: string;
};

export class VendorServiceController {
  // ================= CREATE SERVICE =================
  public async createService(req: AuthenticatedVendorRequest, res: Response) {
    let service: any = null;
    const uploadedFiles: string[] = [];

    try {
      // Convert numeric fields
      ['price', 'latitude', 'longitude'].forEach((field) => {
        if (req.body[field]) req.body[field] = Number(req.body[field]);
      });

      const vendorId = req.vendorId!;
      const parsed = vendorServiceSchema.safeParse(req.body);

      if (!parsed.success) {
        const errors = parsed.error.errors
          .map((e) => `${e.path.join('.') || 'field'}: ${e.message}`)
          .join(', ');
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, `Validation failed: ${errors}`));
      }

      const {
        title,
        description,
        category,
        price,
        country,
        state,
        city,
        name,
        latitude,
        longitude,
      } = parsed.data;

      // Create service
      service = await prisma.vendorService.create({
        data: {
          vendorId,
          title,
          description,
          category,
          price,
          country,
          state,
          city,
          name,
          latitude,
          longitude,
        },
      });

      logger.info(`Service created with ID: ${service.id}`);

      // ---------------- HANDLE FILES ----------------
      const thumbnailFiles: MulterFile[] = [];
      const mediaFiles: MulterFile[] = [];

      if (req.files) {
        logger.info(`Received files: ${JSON.stringify(Object.keys(req.files))}`);
        const f = req.files as { [fieldname: string]: MulterFile[] };

        if (f.thumbnail) {
          logger.info(`Thumbnail files count: ${f.thumbnail.length}`);
          thumbnailFiles.push(...f.thumbnail);
        }

        if (f.media) {
          logger.info(`Media files count: ${f.media.length}`);
          logger.info(`Media files: ${f.media.map((m) => m.originalname).join(', ')}`);
          mediaFiles.push(...f.media);
        }
      } else {
        logger.warn('No files received in request');
      }

      // Move thumbnail files
      if (thumbnailFiles.length > 0) {
        const movedThumbnails = moveFilesToServiceFolder(service.id, thumbnailFiles);
        uploadedFiles.push(...movedThumbnails.map((f) => f.path));

        const thumbnailFile = movedThumbnails[0]; // Take first thumbnail
        const thumbMedia = await prisma.vendorServiceMedia.create({
          data: {
            vendorServiceId: service.id,
            type: MediaType.THUMBNAIL,
            url: thumbnailFile.url,
          },
        });
        await prisma.vendorService.update({
          where: { id: service.id },
          data: { thumbnailId: thumbMedia.id },
        });
        logger.info(`Thumbnail saved for service ${service.id}`);
      }

      // Move media files (gallery images only)
      if (mediaFiles.length > 0) {
        const movedMedia = moveFilesToServiceFolder(service.id, mediaFiles);
        uploadedFiles.push(...movedMedia.map((f) => f.path));

        await prisma.vendorServiceMedia.createMany({
          data: movedMedia.map((media) => ({
            vendorServiceId: service.id,
            type: MediaType.IMAGE,
            url: media.url,
          })),
        });
        logger.info(`${movedMedia.length} gallery images saved for service ${service.id}`);
      }

      const transformed = await transformServiceFull(service.id);
      return res
        .status(statusCodes.CREATED)
        .json(new ApiResponse(statusCodes.CREATED, transformed, successMessages.SERVICE_CREATED));
    } catch (err: any) {
      logger.error('Error creating service:', err);

      if (service?.id) await prisma.vendorService.delete({ where: { id: service.id } });

      uploadedFiles.forEach((filePath) => fs.existsSync(filePath) && fs.unlinkSync(filePath));

      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            err.message || errorMessages.SERVICE_CREATE_FAILED
          )
        );
    } finally {
      cleanupTempFolder();
    }
  }

  // ================= UPDATE SERVICE =================
  public async updateService(req: AuthenticatedRequest, res: Response) {
    const uploadedFiles: string[] = [];

    try {
      const { serviceId } = req.params;
      if (!serviceId) return res.status(400).json({ message: 'Service ID is required' });

      // Convert numeric fields
      ['price', 'latitude', 'longitude'].forEach((field) => {
        if (req.body[field]) req.body[field] = Number(req.body[field]);
      });

      const parsed = vendorServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        return res.status(400).json({ message: `Validation failed: ${errors}` });
      }

      const existingService = await prisma.vendorService.findUnique({
        where: { id: serviceId },
        include: { thumbnail: true, media: true },
      });
      if (!existingService) return res.status(404).json({ message: 'Service not found' });

      // Process uploaded files - SEPARATE thumbnail and media
      const thumbnailFiles: MulterFile[] = [];
      const mediaFiles: MulterFile[] = [];

      if (req.files) {
        const f = req.files as { [fieldname: string]: MulterFile[] };
        if (f.thumbnail) thumbnailFiles.push(...f.thumbnail);
        if (f.media) mediaFiles.push(...f.media);
      }

      // ---------------- HANDLE THUMBNAIL ----------------
      if (thumbnailFiles.length > 0) {
        const movedThumbnails = moveFilesToServiceFolder(serviceId, thumbnailFiles);
        uploadedFiles.push(...movedThumbnails.map((f) => f.path));

        // Delete old thumbnail
        if (existingService.thumbnailId) {
          const oldThumb = await prisma.vendorServiceMedia.findUnique({
            where: { id: existingService.thumbnailId },
          });
          if (oldThumb) {
            const filePath = getUploadPath(`service_${serviceId}`, path.basename(oldThumb.url));
            deleteFile(filePath);
            await prisma.vendorServiceMedia.delete({ where: { id: existingService.thumbnailId } });
          }
        }

        // Create new thumbnail
        const thumbnailFile = movedThumbnails[0];
        const thumbMedia = await prisma.vendorServiceMedia.create({
          data: {
            vendorServiceId: serviceId,
            type: MediaType.THUMBNAIL,
            url: thumbnailFile.url,
          },
        });
        await prisma.vendorService.update({
          where: { id: serviceId },
          data: { thumbnailId: thumbMedia.id },
        });
        logger.info(`Thumbnail updated for service ${serviceId}`);
      }

      // ---------------- HANDLE MEDIA (Gallery) ----------------
      if (mediaFiles.length > 0) {
        const movedMedia = moveFilesToServiceFolder(serviceId, mediaFiles);
        uploadedFiles.push(...movedMedia.map((f) => f.path));

        await prisma.vendorServiceMedia.createMany({
          data: movedMedia.map((m) => ({
            vendorServiceId: serviceId,
            type: MediaType.IMAGE,
            url: m.url,
          })),
        });
        logger.info(`${movedMedia.length} gallery images added for service ${serviceId}`);
      }

      // ---------------- REMOVE MEDIA ----------------
      // Expecting removeMediaIds to contain URLs instead of IDs
      const removeMediaUrls: string[] = parsed.data.removeMediaIds || [];
      if (removeMediaUrls.length) {
        const mediaToRemove = await prisma.vendorServiceMedia.findMany({
          where: {
            url: { in: removeMediaUrls },
            vendorServiceId: serviceId,
            type: MediaType.IMAGE,
          },
        });
        for (const media of mediaToRemove) {
          const filePath = getUploadPath(`service_${serviceId}`, path.basename(media.url));
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await prisma.vendorServiceMedia.deleteMany({
          where: {
            url: { in: removeMediaUrls },
            vendorServiceId: serviceId,
            type: MediaType.IMAGE,
          },
        });

        logger.info(`${removeMediaUrls.length} gallery images removed from service ${serviceId}`);
      }

      // Update service details
      const {
        title,
        description,
        category,
        price,
        country,
        state,
        city,
        name,
        latitude,
        longitude,
      } = parsed.data;
      await prisma.vendorService.update({
        where: { id: serviceId },
        data: {
          title,
          description,
          category,
          price,
          country,
          state,
          city,
          name,
          latitude,
          longitude,
        },
      });

      const transformed = await transformServiceFull(serviceId);
      return res
        .status(200)
        .json({ success: true, data: transformed, message: successMessages.SERVICE_UPDATED });
    } catch (err: any) {
      logger.error('Error updating service:', err);
      uploadedFiles.forEach((file) => fs.existsSync(file) && fs.unlinkSync(file));
      return res
        .status(500)
        .json({ success: false, message: err.message || errorMessages.SERVICE_UPDATE_FAILED });
    } finally {
      cleanupTempFolder();
    }
  }

  // ================= GET SERVICES =================
  public async getServices(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const services = await prisma.vendorService.findMany();

      const transformed = (
        await Promise.all(services.map((s) => transformServiceFull(s.id)))
      ).filter(Boolean);
      if (!transformed.length) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'No services found for this vendor'));
      }
      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, transformed, successMessages.FETCH_SUCCESS));
    } catch (err) {
      logger.error('Error fetching services:', err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.FETCH_FAILED));
    }
  }

  // ================= GET SERVICE BY ID =================
  public async getServiceById(req: AuthenticatedRequest, res: Response) {
    try {
      const { serviceId } = req.params;
      const service = await prisma.vendorService.findUnique({ where: { id: serviceId } });

      if (!service)
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.SERVICE_NOT_FOUND));

      const transformed = await transformServiceFull(serviceId);
      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, transformed, successMessages.FETCH_SUCCESS));
    } catch (err) {
      logger.error('Error fetching service:', err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.FETCH_FAILED));
    }
  }

  public async getServicesByCategory(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const { category } = req.params;
      const { budgetMin, budgetMax, destinationIds, page = 1, limit = 20 } = req.query;

      const where: any = { category };
      if (budgetMin || budgetMax) {
        where.price = {};
        if (budgetMin) where.price.gte = Number(budgetMin);
        if (budgetMax) where.price.lte = Number(budgetMax);
      }
      if (destinationIds) {
        where.locationId = { in: (destinationIds as string).split(',') };
      }
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const services = await prisma.vendorService.findMany({ where, skip, take });

      const transformed = (
        await Promise.all(services.map((s) => transformServiceFull(s.id)))
      ).filter(Boolean);

      const total = await prisma.vendorService.count({ where });

      return res.status(200).json({
        success: true,
        data: {
          services: transformed,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
          },
        },
        message: 'Services fetched successfully',
      });
    } catch (err) {
      logger.error('Error fetching services by category:', err);
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Failed to fetch services by category',
      });
    }
  }

  // ================= DELETE SERVICE =================
  public async deleteService(req: AuthenticatedRequest, res: Response) {
    try {
      const { serviceId } = req.params;

      if (!serviceId) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Service ID is required'));
      }

      const service = await prisma.vendorService.findUnique({
        where: { id: serviceId },
        include: { media: true, thumbnail: true },
      });

      if (!service) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.SERVICE_NOT_FOUND));
      }

      // Delete the entire service folder
      const serviceFolder = getUploadPath(`service_${serviceId}`);
      if (fs.existsSync(serviceFolder)) {
        fs.rmSync(serviceFolder, { recursive: true, force: true });
        logger.info(`Deleted entire service folder: ${serviceFolder}`);
      }

      // Delete database records
      await prisma.vendorServiceMedia.deleteMany({ where: { vendorServiceId: serviceId } });
      await prisma.vendorService.delete({ where: { id: serviceId } });
      logger.info(`Service ${serviceId} deleted successfully`);
      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.DELETE_SUCCESS));
    } catch (err) {
      logger.error('Error deleting service:', err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.SERVICE_DELETE_FAILED
          )
        );
    }
  }
}

// ================= HELPERS =================
async function transformServiceFull(serviceId: string) {
  const service = await prisma.vendorService.findUnique({
    where: { id: serviceId },
    include: {
      media: {
        where: { type: MediaType.IMAGE }, // Only get IMAGE type for gallery
      },
      thumbnail: true,
    },
  });

  if (!service) return null;

  return {
    ...service,
    thumbnail: service.thumbnail || null,
    media: service.media || [],
  };
}

// ================= MOVE FILES =================
function moveFilesToServiceFolder(serviceId: string, files: MulterFile[]): MovedFile[] {
  logger.info(`moveFilesToServiceFolder called with ${files.length} files`);
  const serviceDir = getUploadPath(`service_${serviceId}`);
  if (!fs.existsSync(serviceDir)) {
    fs.mkdirSync(serviceDir, { recursive: true });
    logger.info(`Created service directory: ${serviceDir}`);
  }

  const movedFiles: MovedFile[] = [];
  for (const file of files) {
    logger.info(
      `Processing file: ${file.originalname}, path: ${file.path}, fieldname: ${file.fieldname}`
    );

    if (!fs.existsSync(file.path)) {
      logger.warn(`Temp file not found, skipping: ${file.path}`);
      continue;
    }

    const safeName = sanitizeFilename(file.originalname);
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${safeName}`;
    const destPath = getUploadPath(`service_${serviceId}`, uniqueName);
    try {
      fs.renameSync(file.path, destPath);
      movedFiles.push({
        path: destPath,
        fieldname: file.fieldname,
        url: `${SERVER_URL}/uploads/service_${serviceId}/${uniqueName}`,
      });
      logger.info(`Moved file: ${file.originalname} -> ${destPath}`);
    } catch (err) {
      logger.error(`Error moving file ${file.path}:`, err);
    }
  }

  logger.info(`Successfully moved ${movedFiles.length} files`);
  return movedFiles;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\[\]\s]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase();
}

function cleanupTempFolder() {
  const tempDir = getUploadPath('temp');
  try {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      logger.info(`Cleaning up temp folder. Found ${files.length} files`);

      // Only delete files, not the directory itself
      files.forEach((file) => {
        const filePath = path.join(tempDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });

      logger.info('Cleaned up temp folder');
    }
  } catch (err) {
    logger.error('Error cleaning up temp folder:', err);
  }
}

export function getUploadPath(folder: 'temp' | `service_${string}`, filename?: string) {
  const baseDir = path.join(process.cwd(), 'uploads');
  if (filename) {
    return path.join(baseDir, folder, filename);
  }
  return path.join(baseDir, folder);
}
