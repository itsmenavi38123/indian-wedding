import { Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { statusCodes, successMessages, errorMessages } from '@/constant';
import { logger } from '@/logger';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';

export class WeddingPlanController {
  // ================= CREATE WEDDING PLAN =================
  public async createWeddingPlan(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const { destinationId, totalBudget, guestCount, category, events, services } = req.body;

      if (!userId) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, 'Unauthorized: userId missing'));
      }
      if (destinationId) {
        const destination = await prisma.destination.findUnique({
          where: { id: destinationId },
        });
        if (!destination) {
          return res
            .status(statusCodes.NOT_FOUND)
            .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Destination not found'));
        }
      }

      const weddingPlan = await prisma.weddingPlan.create({
        data: {
          userId,
          destinationId,
          totalBudget: totalBudget ? BigInt(totalBudget) : null,
          guests: guestCount ?? null,
          category: category ?? [],
          events:
            events && Array.isArray(events)
              ? {
                  create: events.map((event: any) => ({
                    userId,
                    name: event.name,
                    date: new Date(event.date),
                    startTime: event.startTime,
                    endTime: event.endTime,
                  })),
                }
              : undefined,
          services:
            services && Array.isArray(services)
              ? {
                  create: services.map((service: any) => ({
                    vendorServiceId: service.vendorServiceId,
                    quantity: service.quantity ?? 1,
                    notes: service.notes ?? null,
                  })),
                }
              : undefined,
        },
        include: {
          destination: true,
          events: true,
          services: {
            include: {
              vendorService: {
                include: {
                  vendor: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      logger.info(`Wedding plan created: ${weddingPlan.id}`);
      const serializedPlan = JSON.parse(
        JSON.stringify(weddingPlan, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      );
      return res
        .status(statusCodes.CREATED)
        .json(
          new ApiResponse(statusCodes.CREATED, serializedPlan, successMessages.WEDDING_PLAN_CREATED)
        );
    } catch (err: any) {
      logger.error('Error creating wedding plan:', err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            err.message || errorMessages.CREATE_FAILED
          )
        );
    }
  }

  // ================= ADD WEDDING EVENTS =================

  public async addWeddingEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, weddingPlanId, events } = req.body;

      if (!userId || !events?.length) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(
              statusCodes.BAD_REQUEST,
              null,
              'userId and at least one event are required'
            )
          );
      }

      const data = events.map((ev: any) => ({
        userId,
        weddingPlanId,
        name: ev.name,
        date: new Date(ev.date),
        startTime: ev.startTime,
        endTime: ev.endTime,
      }));

      await prisma.weddingEvent.createMany({ data });

      logger.info(`Added ${events.length} events for user ${userId}`);
      return res
        .status(statusCodes.CREATED)
        .json(new ApiResponse(statusCodes.CREATED, null, successMessages.CREATE_SUCCESS));
    } catch (err: any) {
      logger.error('Error adding wedding events:', err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            err.message || errorMessages.CREATE_FAILED
          )
        );
    }
  }
}
