import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
import { statusCodes, errorMessages, successMessages } from '@/constant';
import { ProposalStatus, UserRole } from '@prisma/client';
import { notificationService } from '@/services/notification.service';

export class ProposalController {
  public async saveDraft(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const {
        reference,
        title,
        template,
        companyName,
        logoUrl,
        dateISO,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        introHTML,
        termsText,
        paymentTerms,
        taxesPercent,
        discount,
        services,
        customLines,
        budgetMin,
        budgetMax,
        guestCountMin,
        guestCountMax,
        preferredLocations,
        events,
      } = req.body;

      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          weddingPlan: {
            include: { events: true },
          },
        },
      });

      if (!lead) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Lead not found'));
      }

      let proposalEvents = events || [];
      if ((!proposalEvents || proposalEvents.length === 0) && lead.weddingPlan?.events?.length) {
        proposalEvents = lead.weddingPlan.events.map((e: any) => ({
          name: e.name,
          dateISO: e.date?.toISOString?.() || null,
          startTime: e.startTime,
          endTime: e.endTime,
        }));
      }

      const existingDraft = await prisma.proposal.findFirst({
        where: {
          leadId,
          status: ProposalStatus.DRAFT,
        },
      });

      let proposal;

      if (existingDraft) {
        // Update existing draft
        proposal = await prisma.proposal.update({
          where: { id: existingDraft.id },
          data: {
            title,
            template,
            companyName,
            logoUrl,
            dateISO,
            clientName,
            clientEmail,
            clientPhone,
            clientAddress,
            introHTML,
            termsText,
            paymentTerms,
            taxesPercent,
            discount,
            budgetMin,
            budgetMax,
            guestCountMin,
            guestCountMax,
            preferredLocations,
            events: proposalEvents,
            updatedAt: new Date(),
          },

          include: {
            services: true,
            customLines: true,
          },
        });

        // Delete existing services and custom lines
        await prisma.proposalService.deleteMany({
          where: { proposalId: proposal.id },
        });
        await prisma.proposalCustomLine.deleteMany({
          where: { proposalId: proposal.id },
        });

        // Create new services
        if (services && services.length > 0) {
          await prisma.proposalService.createMany({
            data: services.map((service: any, index: number) => ({
              proposalId: proposal.id,
              name: service.name,
              description: service.description,
              price: service.price,
              category: service.category || service.vendorService?.category || 'Other',
              quantity: service.quantity || 1,
              order: index,
              vendorId: service.vendorId || service.vendor?.id || null,
              vendorServiceId: service.vendorServiceId || null,
            })),
          });
        }

        // Create new custom lines
        if (customLines && customLines.length > 0) {
          await prisma.proposalCustomLine.createMany({
            data: customLines.map((line: any) => ({
              proposalId: proposal.id,
              label: line.label,
              unitPrice: line.unitPrice,
              quantity: line.quantity || 1,
            })),
          });
        }

        // Fetch the updated proposal with relations
        proposal = await prisma.proposal.findUnique({
          where: { id: proposal.id },
          include: {
            services: true,
            customLines: true,
          },
        });
      } else {
        // Create new draft
        proposal = await prisma.proposal.create({
          data: {
            leadId,
            reference,
            title,
            template,
            companyName,
            logoUrl,
            dateISO,
            clientName,
            clientEmail,
            clientPhone,
            clientAddress,
            introHTML,
            termsText,
            paymentTerms,
            taxesPercent,
            discount,
            status: ProposalStatus.DRAFT,
            budgetMin,
            budgetMax,
            guestCountMin,
            guestCountMax,
            preferredLocations,
            events: proposalEvents,
            services: {
              create:
                services?.map((service: any, index: number) => ({
                  name: service.name,
                  description: service.description,
                  price: service.price,
                  category: service.category || service.vendorService?.category || 'Other',
                  quantity: service.quantity || 1,
                  order: index,
                  vendorId: service.vendorId || service.vendor?.id || null,
                  vendorServiceId: service.vendorServiceId || null,
                })) || [],
            },

            customLines: {
              create:
                customLines?.map((line: any) => ({
                  label: line.label,
                  unitPrice: line.unitPrice,
                  quantity: line.quantity || 1,
                })) || [],
            },
          },
          include: {
            services: true,
            customLines: true,
          },
        });
      }

      // Calculate subtotal and grand total
      const servicesTotal = proposal.services.reduce(
        (sum, service) => sum + service.price * service.quantity,
        0
      );
      const customLinesTotal = proposal.customLines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0
      );
      const subtotal = servicesTotal + customLinesTotal;
      const taxableAmount = Math.max(0, subtotal - proposal.discount);
      const tax = taxableAmount * (proposal.taxesPercent / 100);
      const grandTotal = taxableAmount + tax;

      // Update totals
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: {
          subtotal,
          grandTotal,
        },
      });

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { ...proposal, subtotal, grandTotal },
            successMessages.PROPOSAL_DRAFT_SAVED
          )
        );
    } catch (error) {
      logger.error('Error saving draft:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PROPOSAL_DRAFT_SAVE_FAILED
          )
        );
    }
  }

  public async getDraft(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const draft = await prisma.proposal.findFirst({
        where: {
          leadId,
          status: ProposalStatus.DRAFT,
        },
        include: {
          services: {
            orderBy: {
              order: 'asc',
            },
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  contactNo: true,
                  serviceTypes: true,
                },
              },
            },
          },
          customLines: true,
          versions: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 20,
          },
        },
      });

      if (!draft) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.PROPOSAL_NOT_FOUND));
      }

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, draft, successMessages.PROPOSAL_DRAFT_FETCHED));
    } catch (error) {
      logger.error('Error fetching draft:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PROPOSAL_DRAFT_FETCH_FAILED
          )
        );
    }
  }

  public async saveVersion(req: Request, res: Response) {
    try {
      const { proposalId } = req.params;
      const { snapshot } = req.body;

      const version = await prisma.proposalVersion.create({
        data: {
          proposalId,
          snapshot,
        },
      });

      res
        .status(statusCodes.CREATED)
        .json(
          new ApiResponse(statusCodes.CREATED, version, successMessages.PROPOSAL_VERSION_SAVED)
        );
    } catch (error) {
      logger.error('Error saving version:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PROPOSAL_VERSION_SAVE_FAILED
          )
        );
    }
  }

  public async finalizeProposal(req: Request, res: Response) {
    try {
      const { proposalId } = req.params;

      const proposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          status: ProposalStatus.SENT,
          sentAt: new Date(),
        },
        include: {
          lead: {
            select: {
              id: true,
              createdById: true,
              title: true,
            },
          },
          services: true,
          customLines: true,
        },
      });

      try {
        const proposalTitle = proposal.lead?.title ?? 'Unnamed Proposal';
        const userId = proposal.lead?.createdById;

        // 🔹 Notify USER (client)
        if (userId) {
          await notificationService.sendNotification({
            message: `A new proposal has been sent to you.`,
            type: 'proposal_sent',
            recipientId: userId,
            recipientRole: UserRole.USER,
          });
        }

        // 🔹 Notify all ADMINS
        const admins = await prisma.admin.findMany({
          where: { role: UserRole.ADMIN },
        });

        for (const admin of admins) {
          await notificationService.sendNotification({
            message: `Your Proposal has been successfully sent to the client.`,
            type: 'proposal_sent',
            recipientId: admin.id,
            recipientRole: UserRole.ADMIN,
          });
        }
      } catch (notifError) {
        logger.error('Error sending proposal notifications:', notifError);
      }

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, proposal, successMessages.PROPOSAL_FINALIZED));
    } catch (error) {
      logger.error('Error finalizing proposal:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PROPOSAL_FINALIZE_FAILED
          )
        );
    }
  }
  // Get proposal by ID
  public async getProposalById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          services: {
            orderBy: { order: 'asc' },
            include: {
              // Include vendorService → vendor chain
              vendorService: {
                include: {
                  vendor: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      contactNo: true,
                      serviceTypes: true,
                    },
                  },
                },
              },
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  contactNo: true,
                  serviceTypes: true,
                },
              },
            },
          },
          customLines: true,
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!proposal) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.PROPOSAL_NOT_FOUND));
      }

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, proposal, successMessages.PROPOSAL_FETCHED));
    } catch (error) {
      logger.error('Error fetching proposal:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PROPOSAL_FETCH_FAILED
          )
        );
    }
  }
  // Get all proposals
  public async getAllProposals(req: Request, res: Response) {
    try {
      const { status, search } = req.query;

      const where: any = {};

      if (status && status !== 'ALL') {
        where.status = status as ProposalStatus;
      }

      if (search) {
        where.OR = [
          { reference: { contains: search as string, mode: 'insensitive' } },
          { title: { contains: search as string, mode: 'insensitive' } },
          { clientName: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const proposals = await prisma.proposal.findMany({
        where,
        include: {
          services: false,
          customLines: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, proposals, successMessages.PROPOSALS_FETCHED));
    } catch (error) {
      logger.error('Error fetching proposals:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PROPOSALS_FETCH_FAILED
          )
        );
    }
  }
  // Wedding Package Methods
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

  public async assignVendors(req: Request, res: Response) {
    try {
      const { proposalId } = req.params;
      const { assignments } = req.body;

      if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'No vendor assignments provided.'));
      }

      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
      });

      if (!proposal) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Proposal not found.'));
      }

      const updates = await Promise.all(
        assignments.map(async (item: { serviceId: string; vendorId: string }) => {
          return prisma.proposalService.update({
            where: { id: item.serviceId },
            data: {
              vendorId: item.vendorId,
              status: 'ASSIGNED',
              updatedAt: new Date(),
            },
            include: {
              vendor: true,
            },
          });
        })
      );

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            updates,
            successMessages.PROPOSAL_VENDORS_ASSIGNED || 'Vendors assigned successfully.'
          )
        );
    } catch (error) {
      logger.error('Error assigning vendors:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            'Failed to assign vendors. Please try again.'
          )
        );
    }
  }

  public async getUserProposals(req: Request, res: Response) {
    try {
      const { clientId } = req.params;

      if (!clientId) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Client ID is required'));
      }

      const proposals = await prisma.proposal.findMany({
        where: {
          lead: {
            createdById: clientId,
          },
          status: {
            in: [
              ProposalStatus.SENT,
              ProposalStatus.VIEWED,
              ProposalStatus.ACCEPTED,
              ProposalStatus.REJECTED,
            ],
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              title: true,
              partner1Name: true,
              partner2Name: true,
              weddingDate: true,
            },
          },
          services: {
            include: {
              vendorService: {
                include: {
                  vendor: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      contactNo: true,
                      serviceTypes: true,
                    },
                  },
                },
              },
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  contactNo: true,
                  serviceTypes: true,
                },
              },
            },
          },
          customLines: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, proposals, 'Client proposals fetched successfully.'));
    } catch (error) {
      logger.error('Error fetching user proposals:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to fetch proposals.')
        );
    }
  }

  public async updateProposalStatus(req: Request, res: Response) {
    try {
      const { proposalId } = req.params;
      const { action, viewerRole } = req.body;

      const proposal = await prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          lead: {
            select: {
              id: true,
              title: true,
              createdById: true,
            },
          },
        },
      });

      if (!proposal) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Proposal not found'));
      }
      let newStatus: ProposalStatus | null = null;

      const now = new Date();

      if (viewerRole === 'user') {
        switch (action) {
          case 'view':
            if (proposal.status === 'SENT') newStatus = 'VIEWED';
            break;

          case 'accept':
            if (['SENT', 'VIEWED'].includes(proposal.status)) newStatus = 'ACCEPTED';
            break;

          case 'reject':
            if (['SENT', 'VIEWED'].includes(proposal.status)) newStatus = 'REJECTED';
            break;

          default:
            return res
              .status(statusCodes.BAD_REQUEST)
              .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Invalid action'));
        }
      }

      if (!newStatus) {
        return res
          .status(statusCodes.OK)
          .json(new ApiResponse(statusCodes.OK, { updated: false }, 'No status change required'));
      }

      await prisma.proposal.update({
        where: { id: proposalId },

        data: {
          status: newStatus,
          viewedAt: action === 'view' ? now : undefined,
          acceptedAt: action === 'accept' ? now : undefined,
          rejectedAt: action === 'reject' ? now : undefined,
        },
      });

      if (action === 'accept') {
        await prisma.weddingPlanService.updateMany({
          where: {
            weddingPlan: {
              lead: {
                id: proposal.lead.id,
              },
            },
            status: { in: ['PENDING', 'ASSIGNED'] },
          },
          data: {
            status: 'ACCEPTED',
          },
        });

        const acceptedVendorServices = await prisma.weddingPlanService.findMany({
          where: {
            weddingPlan: {
              lead: {
                id: proposal.lead.id,
              },
            },
            status: 'ACCEPTED',
          },
          select: {
            vendorServiceId: true,
            notes: true,
            vendorService: {
              select: {
                vendorId: true,
              },
            },
          },
        });

        const acceptedVendorServiceIds = acceptedVendorServices
          .map((v) => v.vendorServiceId)
          .filter(Boolean);
        console.log('Accepted Vendor Services:', acceptedVendorServiceIds);

        if (acceptedVendorServiceIds.length > 0) {
          await prisma.proposalService.updateMany({
            where: {
              proposalId,
              vendorServiceId: { in: acceptedVendorServiceIds },
            },
            data: {
              status: 'ASSIGNED',
              updatedAt: new Date(),
            },
          });
        } else {
          await prisma.proposalService.updateMany({
            where: {
              proposalId,
              status: 'PENDING',
            },
            data: {
              status: 'ASSIGNED',
              updatedAt: new Date(),
            },
          });
        }
      }

      try {
        const userId = proposal.lead?.createdById;

        const admins = await prisma.admin.findMany({ where: { role: UserRole.ADMIN } });
        for (const admin of admins) {
          await notificationService.sendNotification({
            message: `Proposal was ${newStatus.toLowerCase()} by the client.`,
            type: `proposal_${newStatus.toLowerCase()}`,
            recipientId: admin.id,
            recipientRole: UserRole.ADMIN,
          });
        }

        if (userId) {
          await notificationService.sendNotification({
            message: `Your proposal has been marked as ${newStatus.toLowerCase()}.`,
            type: `proposal_${newStatus.toLowerCase()}`,
            recipientId: userId,
            recipientRole: UserRole.USER,
          });
        }
      } catch (notifError) {
        logger.error('Failed to send proposal status notifications:', notifError);
      }

      return res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { updated: true, newStatus },
            `Proposal marked as ${newStatus.toLowerCase()}`
          )
        );
    } catch (error) {
      logger.error('Error updating proposal status:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            'Failed to update proposal status'
          )
        );
    }
  }
}

export const proposalController = new ProposalController();
