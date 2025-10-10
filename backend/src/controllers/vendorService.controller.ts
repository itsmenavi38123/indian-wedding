import { Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
import { statusCodes, errorMessages, successMessages } from '@/constant';
import { createServiceSchema, updateServiceSchema } from '@/validators/services/services';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import { deleteFile } from '@/services/fileService';
import { File as MulterFile } from 'multer';
import path from 'path';
import fs from 'fs';
import { MediaType } from '@prisma/client';
import { AuthenticatedVendorRequest } from '@/middlewares/vendorAuthMiddleware';

// ================= Type for moved files =================
type MovedFile = {
  path: string;
  fieldname: string;
  url: string;
};

export class VendorServiceController {
  // ================= CREATE SERVICE =================
  public async createService(req: AuthenticatedVendorRequest, res: Response) {
    let service: any = null;
    try {
      if (req.body.price) req.body.price = Number(req.body.price);
      if (req.body.latitude) req.body.latitude = Number(req.body.latitude);
      if (req.body.longitude) req.body.longitude = Number(req.body.longitude);

      const vendorId = req.vendorId!;
      const parsed = createServiceSchema.safeParse(req.body);

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

      // ================= CREATE SERVICE =================
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

      // ================= MOVE FILES =================
      const files: MulterFile[] = [];
      if (req.files) {
        const f = req.files as { [fieldname: string]: MulterFile[] };
        if (f.thumbnail) files.push(...f.thumbnail);
        if (f.media) files.push(...f.media);
      }

      const movedFiles: MovedFile[] = moveFilesToServiceFolder(service.id, files);

      // ================= SAVE THUMBNAIL =================
      const thumbnailFile = movedFiles.find((f) => f.fieldname === 'thumbnail');
      if (thumbnailFile) {
        const thumbMedia = await prisma.vendorServiceMedia.create({
          data: { vendorServiceId: service.id, type: MediaType.THUMBNAIL, url: thumbnailFile.url },
        });
        await prisma.vendorService.update({
          where: { id: service.id },
          data: { thumbnailId: thumbMedia.id },
        });
      }

      // ================= SAVE MEDIA FILES =================
      const mediaFiles = movedFiles.filter((f) => f.fieldname === 'media');
      for (const media of mediaFiles) {
        await prisma.vendorServiceMedia.create({
          data: { vendorServiceId: service.id, type: MediaType.IMAGE, url: media.url },
        });
      }

      const transformed = await transformServiceFull(service.id);
      return res
        .status(statusCodes.CREATED)
        .json(new ApiResponse(statusCodes.CREATED, transformed, successMessages.SERVICE_CREATED));
    } catch (err) {
      logger.error('Error creating service:', err);
      if (service) await prisma.vendorService.delete({ where: { id: service.id } });
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.SERVICE_CREATE_FAILED
          )
        );
    } finally {
      cleanupTempFolder();
    }
  }

  // ================= UPDATE SERVICE =================
  public async updateService(req: AuthenticatedRequest, res: Response) {
    try {
      const { serviceId } = req.params; // <-- use correct route param
      if (!serviceId) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Service ID is required'));
      }

      // Convert numeric fields from form-data strings
      if (req.body.price) req.body.price = Number(req.body.price);
      if (req.body.latitude) req.body.latitude = Number(req.body.latitude);
      if (req.body.longitude) req.body.longitude = Number(req.body.longitude);

      // Validate request body
      const parsed = updateServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.errors
          .map((e) => `${e.path.join('.') || 'field'}: ${e.message}`)
          .join(', ');
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, `Validation failed: ${errors}`));
      }

      const existingService = await prisma.vendorService.findUnique({ where: { id: serviceId } });
      if (!existingService) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.SERVICE_NOT_FOUND));
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
        removeMediaIds,
      } = parsed.data;

      // ================= MOVE UPLOADED FILES =================
      const files: MulterFile[] = [];
      if (req.files) {
        const f = req.files as { [fieldname: string]: MulterFile[] };
        if (f.thumbnail) files.push(...f.thumbnail);
        if (f.media) files.push(...f.media);
      }

      const movedFiles: MovedFile[] = moveFilesToServiceFolder(serviceId, files);

      // ================= HANDLE THUMBNAIL =================
      const thumbnailFile = movedFiles.find((f) => f.fieldname === 'thumbnail');
      if (thumbnailFile) {
        if (existingService.thumbnailId) {
          const oldThumb = await prisma.vendorServiceMedia.findUnique({
            where: { id: existingService.thumbnailId },
          });
          if (oldThumb) deleteFile(path.join(process.cwd(), oldThumb.url));
          await prisma.vendorServiceMedia.delete({ where: { id: existingService.thumbnailId } });
        }

        const thumbMedia = await prisma.vendorServiceMedia.create({
          data: { vendorServiceId: serviceId, type: MediaType.THUMBNAIL, url: thumbnailFile.url },
        });

        await prisma.vendorService.update({
          where: { id: serviceId },
          data: { thumbnailId: thumbMedia.id },
        });
      }

      // ================= REMOVE SELECTED MEDIA =================
      if (removeMediaIds && removeMediaIds.length > 0) {
        const mediaToRemove = await prisma.vendorServiceMedia.findMany({
          where: { id: { in: removeMediaIds }, vendorServiceId: serviceId, type: MediaType.IMAGE },
        });
        mediaToRemove.forEach((m) => deleteFile(path.join(process.cwd(), m.url)));
        await prisma.vendorServiceMedia.deleteMany({
          where: { id: { in: removeMediaIds }, vendorServiceId: serviceId, type: MediaType.IMAGE },
        });
      }

      // ================= ADD NEW MEDIA FILES =================
      const mediaFiles = movedFiles.filter((f) => f.fieldname === 'media');
      for (const media of mediaFiles) {
        await prisma.vendorServiceMedia.create({
          data: { vendorServiceId: serviceId, type: MediaType.IMAGE, url: media.url },
        });
      }

      // ================= UPDATE SERVICE DATA =================
      await prisma.vendorService.update({
        where: { id: serviceId },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(category && { category }),
          ...(price && { price }),
          ...(country && { country }),
          ...(state && { state }),
          ...(city && { city }),
          ...(name && { name }),
          ...(latitude && { latitude }),
          ...(longitude && { longitude }),
        },
      });

      const transformed = await transformServiceFull(serviceId);
      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, transformed, successMessages.SERVICE_UPDATED));
    } catch (err) {
      logger.error('Error updating service:', err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.SERVICE_UPDATE_FAILED
          )
        );
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
      const { id } = req.params;
      const service = await prisma.vendorService.findUnique({ where: { id } });
      if (!service)
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.SERVICE_NOT_FOUND));

      const transformed = await transformServiceFull(id);
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
      const { id } = req.params;
      const service = await prisma.vendorService.findUnique({ where: { id } });
      if (!service)
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.SERVICE_NOT_FOUND));

      const mediaFiles = await prisma.vendorServiceMedia.findMany({
        where: { vendorServiceId: id },
      });
      mediaFiles.forEach((m) => deleteFile(path.join(process.cwd(), m.url)));
      await prisma.vendorServiceMedia.deleteMany({ where: { vendorServiceId: id } });
      await prisma.vendorService.delete({ where: { id } });

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
    include: { media: true, thumbnail: true },
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
  const serviceDir = path.join(process.cwd(), 'uploads', `service_${serviceId}`);
  if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir, { recursive: true });

  const movedFiles: MovedFile[] = [];

  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      console.warn(`Temp file not found, skipping: ${file.path}`);
      continue;
    }

    const safeName = sanitizeFilename(file.originalname);
    const destPath = path.join(serviceDir, safeName);
    fs.renameSync(file.path, destPath);
   const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
    movedFiles.push({
      path: destPath,
      fieldname: file.fieldname,
      url: `${SERVER_URL}/uploads/service_${serviceId}/${safeName}`,
    });
  }

  return movedFiles;
}

function sanitizeFilename(name: string) {
  return name.replace(/[\[\]\s]/g, '_');
}

function cleanupTempFolder() {
  const tempDir = path.join(process.cwd(), 'uploads', 'temp');
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
}
