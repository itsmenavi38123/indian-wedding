import { Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { statusCodes, successMessages, errorMessages } from '@/constant';
import { logger } from '@/logger';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import { notificationService } from '@/services/notification.service';
import { ProposalServiceStatus, UserRole } from '@prisma/client';

export class WeddingPlanController {
  // ================= CREATE WEDDING PLAN =================
  public async createWeddingPlan(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;
      const {
        destinationId,
        totalBudget,
        guestCount,
        category,
        events,
        services,
        selectedVendors,
      } = req.body;

      let destination: any = null;

      if (!userId) {
        return res
          .status(statusCodes.UNAUTHORIZED)
          .json(new ApiResponse(statusCodes.UNAUTHORIZED, null, 'Unauthorized: userId missing'));
      }
      if (destinationId) {
        destination = await prisma.destination.findUnique({
          where: { id: destinationId },
        });
        logger.info(`Fetched destination: ${JSON.stringify(destination)}`);
        if (!destination) {
          return res
            .status(statusCodes.NOT_FOUND)
            .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Destination not found'));
        }
      }

      let servicesToCreate: any[] = [];

      if (services && Array.isArray(services) && services.length > 0) {
        servicesToCreate = services.map((service: any) => ({
          vendorServiceId: service.vendorServiceId,
          quantity: service.quantity ?? 1,
          notes: service.notes ?? null,
        }));
      } else if (selectedVendors && typeof selectedVendors === 'object') {
        for (const categoryKey of Object.keys(selectedVendors)) {
          const vendorServices = selectedVendors[categoryKey];
          if (Array.isArray(vendorServices)) {
            vendorServices.forEach((svc: any) => {
              if (svc.vendorServiceId) {
                servicesToCreate.push({
                  vendorServiceId: svc.vendorServiceId,
                  quantity: svc.quantity ?? 1,
                  notes: svc.notes ?? null,
                });
              }
            });
          }
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
            servicesToCreate.length > 0
              ? {
                  create: servicesToCreate,
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

      let weddingDate: Date | null = null;
      if (weddingPlan.events && weddingPlan.events.length > 0) {
        const sortedEvents = weddingPlan.events
          .filter((e) => !!e.date)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        weddingDate = sortedEvents[0]?.date ? new Date(sortedEvents[0].date) : null;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, phone: true },
      });

      const lead = await prisma.lead.create({
        data: {
          createdById: userId,
          weddingPlanId: weddingPlan.id,
          status: 'INQUIRY',
          leadSource: 'WEBSITE',
          weddingDate,
          partner1Name: user?.name ?? 'Unknown',
          partner2Name: null,
          primaryContact: user?.name ?? 'Unknown',
          phoneNumber: user?.phone ?? 'Unknown',
          email: user?.email ?? 'unknown@example.com',
          whatsappNumber: user?.phone ?? req.body.whatsappNumber ?? null,
          whatsappNumberSameAsPhoneNumber: !!(
            req.body.whatsappNumber && req.body.whatsappNumber === (req.body.phoneNumber ?? null)
          ),
          budgetMin: totalBudget ? BigInt(totalBudget) : BigInt(0),
          budgetMax: totalBudget ? BigInt(totalBudget) : BigInt(0),
          guestCountMin: req.body.guestCountMin ?? null,
          guestCountMax: req.body.guestCountMax ?? req.body.guestCount ?? null,
          preferredLocations: destination?.name ? [destination.name] : [],
          initialNotes: req.body.initialNotes ?? null,
        },
      });

      // ===== SEND NOTIFICATIONS =====
      try {
        const userNotification = await notificationService.sendNotification({
          message: 'Your lead has been created successfully.',
          type: 'lead_created',
          recipientId: userId,
          recipientRole: UserRole.USER,
        });
        console.log('Notification to user sent:', userNotification);

        const admins = await prisma.admin.findMany({ where: { role: UserRole.ADMIN } });
        console.log(
          'Admins found:',
          admins.map((a) => a.id)
        );

        for (const admin of admins) {
          const adminNotification = await notificationService.sendNotification({
            message: `New lead created by ${user?.name ?? 'Unknown'}.`,
            type: 'lead_created',
            recipientId: admin.id,
            recipientRole: UserRole.ADMIN,
          });
          console.log(`Notification sent to admin ${admin.id}:`, adminNotification);
        }
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
      }

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

  public async updateWeddingPlanServiceStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!['PENDING', 'ACCEPTED', 'REJECTED', 'ASSIGNED'].includes(status)) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Invalid status value'));
      }

      const updatedService = await prisma.weddingPlanService.update({
        where: { id },
        data: { status, reason: reason || null },
        include: {
          vendorService: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  contactNo: true,
                },
              },
            },
          },
          weddingPlan: { include: { lead: true } },
        },
      });

      if (updatedService?.weddingPlan?.lead?.id && updatedService?.vendorServiceId) {
        const relatedProposal = await prisma.proposal.findFirst({
          where: { leadId: updatedService.weddingPlan.lead.id },
          select: { id: true },
        });
        if (relatedProposal) {
          await prisma.proposalService.updateMany({
            where: {
              proposalId: relatedProposal.id,
              vendorServiceId: updatedService.vendorServiceId,
            },
            data: { status: status as ProposalServiceStatus },
          });

          console.log(
            `🔁 Synced ProposalService (proposal: ${relatedProposal.id}) → ${updatedService.status}`
          );
        } else {
          console.log('⚠️ No related proposal found to sync');
        }
      }

      const serializedService = JSON.parse(
        JSON.stringify(updatedService, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      );
      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, serializedService, 'Status updated successfully'));
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Wedding plan service not found'));
      }

      logger.error('Error updating wedding plan service status:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            'Failed to update wedding plan service status'
          )
        );
    }
  }

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
