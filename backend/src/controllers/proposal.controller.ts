import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/logger';
import { statusCodes, errorMessages, successMessages } from '@/constant';
import { ProposalStatus, PackageCategory } from '@prisma/client';

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
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, "Lead not found"));
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
          services: true,
          customLines: true,
        },
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, proposal, successMessages.PROPOSAL_FINALIZED));
    } catch (error) {
      logger.error('Error finalizing proposal:', error);
      res
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

      return res.status(statusCodes.OK).json(
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

}

export const proposalController = new ProposalController();
