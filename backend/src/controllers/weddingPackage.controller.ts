import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/logger';
import { statusCodes, errorMessages, successMessages } from '@/constant';
import { PackageCategory } from '@prisma/client';

export class WeddingPackageController {
  // Get all wedding packages
  public async getAllPackages(req: Request, res: Response) {
    try {
      const packages = await prisma.weddingPackage.findMany({
        where: {
          isActive: true,
        },
        include: {
          services: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: [{ category: 'asc' }, { totalPrice: 'asc' }],
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, packages, successMessages.PACKAGES_FETCHED));
    } catch (error) {
      logger.error('Error fetching wedding packages:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PACKAGES_FETCH_FAILED
          )
        );
    }
  }

  // Get package by ID
  public async getPackageById(req: Request, res: Response) {
    try {
      const { packageId } = req.params;

      const package_ = await prisma.weddingPackage.findUnique({
        where: { id: packageId },
        include: {
          services: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (!package_) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.PACKAGE_NOT_FOUND));
      }

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, package_, successMessages.PACKAGES_FETCHED));
    } catch (error) {
      logger.error('Error fetching wedding package:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PACKAGES_FETCH_FAILED
          )
        );
    }
  }

  // Create new wedding package
  public async createPackage(req: Request, res: Response) {
    try {
      const { name, description, totalPrice, category, services } = req.body;

      const package_ = await prisma.weddingPackage.create({
        data: {
          name,
          description,
          totalPrice,
          category: category as PackageCategory,
          isSystem: false, // Custom packages are not system packages
          services: {
            create:
              services?.map((service: any, index: number) => ({
                name: service.name,
                description: service.description,
                price: service.price,
                order: index,
              })) || [],
          },
        },
        include: {
          services: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      res
        .status(statusCodes.CREATED)
        .json(new ApiResponse(statusCodes.CREATED, package_, successMessages.PACKAGE_CREATED));
    } catch (error) {
      logger.error('Error creating wedding package:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PACKAGE_CREATE_FAILED
          )
        );
    }
  }

  // Update wedding package
  public async updatePackage(req: Request, res: Response) {
    try {
      const { packageId } = req.params;
      const { name, description, totalPrice, category, services } = req.body;

      // Check if package exists
      const existingPackage = await prisma.weddingPackage.findUnique({
        where: { id: packageId },
      });

      if (!existingPackage) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.PACKAGE_NOT_FOUND));
      }

      // Update package
      const package_ = await prisma.weddingPackage.update({
        where: { id: packageId },
        data: {
          name,
          description,
          totalPrice,
          category: category as PackageCategory,
        },
        include: {
          services: true,
        },
      });

      // Update services if provided
      if (services && Array.isArray(services)) {
        // Delete existing services
        await prisma.weddingPackageService.deleteMany({
          where: { packageId },
        });

        // Create new services
        await prisma.weddingPackageService.createMany({
          data: services.map((service: any, index: number) => ({
            packageId,
            name: service.name,
            description: service.description,
            price: service.price,
            order: index,
          })),
        });

        // Fetch updated package with services
        const updatedPackage = await prisma.weddingPackage.findUnique({
          where: { id: packageId },
          include: {
            services: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        });

        return res
          .status(statusCodes.OK)
          .json(new ApiResponse(statusCodes.OK, updatedPackage, successMessages.PACKAGE_UPDATED));
      }

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, package_, successMessages.PACKAGE_UPDATED));
    } catch (error) {
      logger.error('Error updating wedding package:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PACKAGE_UPDATE_FAILED
          )
        );
    }
  }

  // Delete wedding package (soft delete by setting isActive to false)
  public async deletePackage(req: Request, res: Response) {
    try {
      const { packageId } = req.params;

      const package_ = await prisma.weddingPackage.findUnique({
        where: { id: packageId },
      });

      if (!package_) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.PACKAGE_NOT_FOUND));
      }

      // Soft delete by setting isActive to false
      await prisma.weddingPackage.update({
        where: { id: packageId },
        data: {
          isActive: false,
        },
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.PACKAGE_DELETED));
    } catch (error) {
      logger.error('Error deleting wedding package:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PACKAGE_DELETE_FAILED
          )
        );
    }
  }
}

export const weddingPackageController = new WeddingPackageController();
