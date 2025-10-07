import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { statusCodes } from '@/constant';

export class DestinationController {
  public async suggest(req: Request, res: Response) {
    const { budgetMin, budgetMax, query } = req.query as Record<string, string>;
    const where: any = {
      ...(budgetMin ? { baseCostMin: { lte: parseInt(budgetMin, 10) } } : {}),
      ...(budgetMax ? { baseCostMax: { lte: parseInt(budgetMax, 10) } } : {}),
      ...(query ? { name: { contains: String(query), mode: 'insensitive' } } : {}),
    };
    const items = await prisma.destination.findMany({
      where,
      include: { photos: true },
      orderBy: { name: 'asc' },
    });
    return res.status(statusCodes.OK).json(new ApiResponse(statusCodes.OK, items));
  }
  public async photos(req: Request, res: Response) {
    const { destinationId } = req.params;
    const { category } = req.query as Record<string, string>;
    const where: any = { destinationId };
    if (category) where.category = category;
    const photos = await prisma.destinationPhoto.findMany({
      where,
      include: { vendorService: true },
    });
    return res.status(statusCodes.OK).json(new ApiResponse(statusCodes.OK, photos));
  }
  // Get all destinations for planning flow
  public async getAllDestinations(req: Request, res: Response) {
    try {
      const { budgetMin, budgetMax } = req.query as Record<string, string>;
      const where: any = {};
      if (budgetMin) {
        where.baseCostMin = { lte: parseInt(budgetMin, 10) };
      }
      if (budgetMax) {
        where.baseCostMax = { gte: parseInt(budgetMax, 10) };
      }
      const destinations = await prisma.destination.findMany({
        where,
        include: {
          photos: {
            where: { category: 'hero' },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      });
      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, destinations, 'Destinations fetched'));
    } catch (error) {
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to fetch destinations')
        );
    }
  }
  // Get destination details with all photos
  public async getDestinationDetails(req: Request, res: Response) {
    try {
      const { destinationId } = req.params;
      const destination = await prisma.destination.findUnique({
        where: { id: destinationId },
        include: {
          photos: {
            include: {
              vendorService: {
                include: {
                  vendor: {
                    select: { name: true, id: true },
                  },
                },
              },
            },
          },
        },
      });
      if (!destination) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Destination not found'));
      }
      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, destination, 'Destination details fetched'));
    } catch (error) {
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            'Failed to fetch destination details'
          )
        );
    }
  }
  // Get photos by category for a destination
  public async getPhotosByCategory(req: Request, res: Response) {
    try {
      const { destinationId, category } = req.params;
      const { page = '1', limit = '20' } = req.query as Record<string, string>;
      const pageNum = parseInt(page, 10);
      const take = parseInt(limit, 10);
      const skip = (pageNum - 1) * take;
      const [photos, total] = await Promise.all([
        prisma.destinationPhoto.findMany({
          where: {
            destinationId,
            category: String(category),
          },
          include: {
            vendorService: {
              include: {
                vendor: {
                  select: { name: true, id: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.destinationPhoto.count({
          where: {
            destinationId,
            category: String(category),
          },
        }),
      ]);
      return res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            photos,
            pagination: { total, page: pageNum, limit: take },
          },
          'Destination photos fetched'
        )
      );
    } catch (error) {
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            'Failed to fetch destination photos'
          )
        );
    }
  }
}

export const destinationController = new DestinationController();
