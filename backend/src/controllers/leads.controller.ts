import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { ApiError } from '@/utils/ApiError';
import { logger } from '@/logger';
import { errorMessages, statusCodes, successMessages } from '@/constant';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import { Parser } from 'json2csv';
import {
  createOrUpdateVendorCardsForLead,
  getTitleDescription,
  sanitizeData,
} from '@/services/vendorMatching.service';
import moment from 'moment';

export class LeadController {
  public async createLead(req: Request, res: Response) {
    try {
      const parsedData = req.body;
      const { serviceTypes, selectedVendorServiceIds = [], ...rest } = parsedData;
      const { title, description } = await getTitleDescription(parsedData);

      const lead = await prisma.lead.create({
        data: {
          ...rest,
          title,
          description,
          weddingDate: parsedData.weddingDate ? new Date(parsedData.weddingDate) : null,
          serviceTypes: serviceTypes || null,
        },
      });

      logger.info(`Lead created: ${lead.id} - Starting vendor matching process`);
      const sanitizedLead = sanitizeData(lead);
      res
        .status(statusCodes.CREATED)
        .json(new ApiResponse(statusCodes.CREATED, sanitizedLead, successMessages.LEAD_CREATED));
    } catch (error) {
      logger.error('Error creating lead:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.LEAD_CREATION_FAILED
          )
        );
    }
  }

  public async getLeads(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        page = '1',
        limit = '25',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        search,
        archived = 'false',
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) where.status = String(status).toUpperCase();
      if (archived === 'true') {
        where.saveStatus = 'ARCHIVED';
      } else {
        where.saveStatus = { not: 'ARCHIVED' };
      }
      if (search) {
        where.OR = [
          { partner1Name: { contains: String(search), mode: 'insensitive' } },
          { partner2Name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
          { phoneNumber: { contains: String(search), mode: 'insensitive' } },
        ];
      }
      // Filter by assigned user if role is USER
      if (req.userRole === 'USER') {
        where.createdById = req.userId;
      }

      const [data, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { [String(sortBy)]: sortOrder === 'asc' ? 'asc' : 'desc' },
          include: { createdBy: true },
        }),
        prisma.lead.count({ where }),
      ]);
      const leads = sanitizeData(data);
      res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            data: leads,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              totalPages: Math.ceil(total / Number(limit)),
            },
          },
          successMessages.LEADS_FETCHED
        )
      );
    } catch (error) {
      logger.error('❌ Error fetching leads:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.LEAD_FETCH_FAILED)
        );
    }
  }

  public async getBoardLeads(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, location, budgetMin, budgetMax, dateFrom, dateTo } = req.query;

      let weddingFrom: Date | undefined;
      let weddingTo: Date | undefined;
      if (dateFrom)
        weddingFrom = moment
          .utc(dateFrom as string)
          .startOf('day')
          .toDate();
      if (dateTo)
        weddingTo = moment
          .utc(dateTo as string)
          .endOf('day')
          .toDate();

      // Fetch filtered leads for the board
      const leads = await prisma.lead.findMany({
        where: {
          saveStatus: { not: 'ARCHIVED' },
          ...(search
            ? {
                OR: [
                  { partner1Name: { contains: search as string, mode: 'insensitive' } },
                  { partner2Name: { contains: search as string, mode: 'insensitive' } },
                ],
              }
            : {}),
          ...(budgetMin ? { budgetMin: { gte: parseInt(budgetMin as string, 10) } } : {}),
          ...(budgetMax ? { budgetMax: { lte: parseInt(budgetMax as string, 10) } } : {}),
          ...(location
            ? {
                OR: [
                  { preferredLocations: { has: location as string } },
                  { preferredLocations: { equals: [] } },
                ],
              }
            : {}),
          ...(weddingFrom || weddingTo
            ? {
                weddingDate: {
                  ...(weddingFrom ? { gte: weddingFrom } : {}),
                  ...(weddingTo ? { lte: weddingTo } : {}),
                },
              }
            : {}),
        },
        include: { createdBy: true },
        orderBy: { createdAt: 'desc' },
      });

      // Get the full budget range from all leads (ignoring filters)
      const allLeads = await prisma.lead.findMany({
        where: { saveStatus: { not: 'ARCHIVED' } },
        select: { budgetMin: true, budgetMax: true },
      });

      const overallBudgetMin = allLeads.length
        ? Math.min(...allLeads.map((l) => Number(l.budgetMin ?? Infinity)))
        : 500_000;

      const overallBudgetMax = allLeads.length
        ? Math.max(...allLeads.map((l) => Number(l.budgetMax ?? 0)))
        : 20_000_000;

      const boardsConfig = [
        { id: 'inquiry', name: 'Inquiry', order: 0, status: 'INQUIRY' },
        { id: 'proposal', name: 'Proposal', order: 1, status: 'PROPOSAL' },
        { id: 'booked', name: 'Booked', order: 2, status: 'BOOKED' },
        { id: 'completed', name: 'Completed', order: 3, status: 'COMPLETED' },
      ];

      const boards = boardsConfig.map((board) => {
        const boardLeads = leads.filter((lead) => lead.status === board.status);
        const cards = boardLeads.map((lead) => {
          const daysInStage = Math.floor(
            (Date.now() - new Date(lead.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: lead.id,
            title: `${lead.partner1Name}${lead.partner2Name ? ' & ' + lead.partner2Name : ''}`,
            description: lead.initialNotes || '',
            kanbanBoardId: board.id,
            leadData: {
              partner1Name: lead.partner1Name,
              partner2Name: lead.partner2Name,
              weddingDate: lead.weddingDate,
              budgetMin: lead.budgetMin,
              budgetMax: lead.budgetMax,
              budget: lead.budget,
              phoneNumber: lead.phoneNumber,
              email: lead.email,
              status: lead.status,
              stage: lead.stage,
              daysInStage,
              guestCountMin: lead.guestCountMin,
              guestCountMax: lead.guestCountMax,
              leadSource: lead.leadSource,
              saveStatus: lead?.saveStatus,
              preferredLocations: lead.preferredLocations,
            },
            assignedUser: lead.createdBy
              ? {
                  id: lead.createdBy.id,
                  name: lead.createdBy.name,
                  email: lead.createdBy.email,
                }
              : null,
            teamMembers: [],
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
          };
        });

        return { id: board.id, name: board.name, order: board.order, cards };
      });

      res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            boards: sanitizeData(boards),
            budgetRange: [overallBudgetMin, overallBudgetMax],
          },
          'Kanban boards fetched successfully'
        )
      );
    } catch (error) {
      logger.error('Error fetching kanban boards:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to fetch kanban boards')
        );
    }
  }

  public async getLeadById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      let lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          createdBy: true,
          proposals: true,
          contracts: true,
          payments: true,
          cards: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  contactNo: true,
                  countryCode: true,
                },
              },
              cardTeams: {
                include: {
                  team: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      teamMembers: {
                        select: {
                          teamMember: {
                            select: {
                              id: true,
                              name: true,
                              email: true,
                              phone: true,
                              role: true,
                              avatar: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          weddingPlan: {
            include: {
              destination: true,
              events: true,
              services: {
                include: {
                  vendorService: {
                    include: {
                      vendor: true,
                      media: {
                        where: { type: 'IMAGE' },
                      },
                      thumbnail: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!lead) {
        throw new ApiError(statusCodes.NOT_FOUND, errorMessages.LEAD_NOT_FOUND);
      }
      const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

      const normalizeUrl = (url: string | null | undefined) => {
        if (!url) return null;

        if (url.startsWith('http')) return url;

        if (url.startsWith('/uploads')) return `${BASE_URL}${url}`;

        return `${BASE_URL}/uploads/${url}`;
      };

      lead.weddingPlan?.services?.forEach((service) => {
        const vs = service.vendorService as any;
        if (vs) {
          const thumbnailUrl = normalizeUrl(vs.thumbnail?.url);
          const mediaUrls = vs.media?.map((m: any) => normalizeUrl(m.url)) || [];

          vs.thumbnailUrl = thumbnailUrl;
          vs.mediaUrls = mediaUrls;
        }
      });

      lead = sanitizeData(lead);
      res.status(statusCodes.OK).json(new ApiResponse(statusCodes.OK, lead));
    } catch (error: any) {
      if (error instanceof ApiError) {
        res
          .status(error?.statusCode ?? statusCodes.INTERNAL_SERVER_ERROR)
          .json(
            new ApiResponse(
              error?.statusCode ?? statusCodes.INTERNAL_SERVER_ERROR,
              null,
              error?.message ?? errorMessages.LEAD_FETCH_FAILED
            )
          );
        return;
      }
      logger.error('❌ Error fetching lead:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.LEAD_FETCH_FAILED)
        );
    }
  }

  public async getVendorsByLeadId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          createdBy: true,
          proposals: true,
          contracts: true,
          payments: true,
          cards: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  contactNo: true,
                  countryCode: true,
                },
              },
              cardTeams: {
                include: {
                  team: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      teamMembers: {
                        select: {
                          teamMember: {
                            select: {
                              id: true,
                              name: true,
                              email: true,
                              phone: true,
                              role: true,
                              avatar: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!lead) {
        throw new ApiError(statusCodes.NOT_FOUND, errorMessages.LEAD_NOT_FOUND);
      }

      const leadServiceTypes: string[] = lead.serviceTypes
        ? lead.serviceTypes.split(',').map((s) => s.trim().toLowerCase())
        : [];

      // Step 1: Fetch vendors by budget only
      let vendors = await prisma.vendor.findMany({
        where: {
          isActive: true,
          minimumAmount: { lte: Number(lead.budgetMax) },
          maximumAmount: { gte: Number(lead.budgetMin) },
        },
        include: {
          teams: true,
        },
      });

      // Step 2: Filter vendors by serviceTypes intersection
      if (leadServiceTypes.length) {
        vendors = vendors.filter((vendor) => {
          const vendorServiceTypes = vendor.serviceTypes
            ? vendor.serviceTypes.split(',').map((s) => s.trim().toLowerCase())
            : [];
          return vendorServiceTypes.some((vs) => leadServiceTypes.includes(vs));
        });
      }
      vendors = vendors.filter((vendor) => vendor.teams.length > 0);
      lead = sanitizeData(lead);

      const response = {
        ...lead,
        matchedVendors: vendors.map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          contactNo: vendor.contactNo,
          serviceTypes: vendor.serviceTypes,
          minimumAmount: vendor.minimumAmount,
          maximumAmount: vendor.maximumAmount,
          teams: vendor.teams.map((t) => ({ id: t.id, name: t.name })),
        })),
      };

      res.status(statusCodes.OK).json(new ApiResponse(statusCodes.OK, response));
    } catch (error: any) {
      if (error instanceof ApiError) {
        res
          .status(error?.statusCode ?? statusCodes.INTERNAL_SERVER_ERROR)
          .json(
            new ApiResponse(
              error?.statusCode ?? statusCodes.INTERNAL_SERVER_ERROR,
              null,
              error?.message ?? errorMessages.LEAD_FETCH_FAILED
            )
          );
        return;
      }
      logger.error('❌ Error fetching lead:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.LEAD_FETCH_FAILED)
        );
    }
  }

  // public async updateLead(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const lead = await prisma.lead.findUnique({ where: { id } });
  //     if (!lead) {
  //       return res
  //         .status(statusCodes.NOT_FOUND)
  //         .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Lead not found'));
  //     }

  //     const { title, description } = await getTitleDescription(lead);
  //     const data = req.body;
  //     const { teamIdsByVendor, serviceTypes, createdById, createdBy, weddingPlan, ...rest } = data;
  //     let updatedLead;
  //     if (!teamIdsByVendor || Object.keys(teamIdsByVendor).length === 0) {
  //       // Update lead only if no teamIdsByVendor provided
  //       updatedLead = await prisma.lead.update({
  //         where: { id },
  //         data: {
  //           ...rest,
  //           title,
  //           description,
  //           weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
  //           serviceTypes: serviceTypes || null,
  //         },
  //       });
  //     } else {
  //       // Update handled inside createOrUpdateVendorCardsForLead
  //       createOrUpdateVendorCardsForLead(lead, { teamIdsByVendor }).catch((error) => {
  //         logger.error('Failed to create/update vendor cards for updated lead:', error);
  //       });
  //       updatedLead = await prisma.lead.update({
  //         where: { id },
  //         data: {
  //           ...rest,
  //           title,
  //           description,
  //           weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
  //           serviceTypes: serviceTypes ? serviceTypes : serviceTypes || null,
  //         },
  //       });
  //     }
  //     updatedLead = sanitizeData(updatedLead);
  //     res
  //       .status(statusCodes.OK)
  //       .json(new ApiResponse(statusCodes.OK, updatedLead, successMessages.LEAD_UPDATED));
  //   } catch (error) {
  //     logger.error('Error updating lead:', error);
  //     res
  //       .status(statusCodes.INTERNAL_SERVER_ERROR)
  //       .json(
  //         new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.LEAD_UPDATE_FAILED)
  //       );
  //   }
  // }
  public async updateLead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const lead = await prisma.lead.findUnique({ where: { id } });
      if (!lead) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Lead not found'));
      }
      const userId = (req as any).userId || req.body.createdById || lead.createdById; // ✅ added

      const { title, description } = await getTitleDescription(lead);
      const data = req.body;
      const {
        teamIdsByVendor,
        serviceTypes,
        createdById,
        createdBy,
        guestCount,
        budget,
        weddingPlan,
        ...rest
      } = data;

      let updatedLead;

      // ✅ Case 1: No teamIdsByVendor
      if (!teamIdsByVendor || Object.keys(teamIdsByVendor).length === 0) {
        // ✅ Case 1A: No wedding plan
        if (!weddingPlan) {
          updatedLead = await prisma.lead.update({
            where: { id },
            data: {
              ...rest,
              guestCountMin: guestCount?.[0],
              guestCountMax: guestCount?.[1],
              budgetMin: budget?.[0],
              budgetMax: budget?.[1],
              title,
              description,
              weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
              serviceTypes: serviceTypes || null,
            },
            include: {
              weddingPlan: {
                include: {
                  destination: true,
                  events: true,
                  services: {
                    include: {
                      vendorService: {
                        include: {
                          vendor: true,
                          media: { where: { type: 'IMAGE' } },
                          thumbnail: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        }

        // ✅ Case 1B: Wedding plan present
        // ✅ Case 1B: Wedding plan present
        else {
          updatedLead = await prisma.lead.update({
            where: { id },
            data: {
              ...rest,
              title,
              description,
              weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
              serviceTypes: serviceTypes || null,

              weddingPlan: {
                upsert: {
                  create: {
                    user: { connect: { id: userId } },

                    events: {
                      create: weddingPlan.events?.map((e: any) => ({
                        name: e.name,
                        date: new Date(e.date),
                        startTime: e.startTime,
                        endTime: e.endTime,
                        user: { connect: { id: userId } },
                      })),
                    },

                    services: {
                      create: weddingPlan.services?.map((s: any) => {
                        if (!s.vendorServiceId) {
                          throw new Error(`vendorServiceId is missing for service: ${s.title}`);
                        }
                        return {
                          quantity: s.quantity ?? 1,
                          notes: s.notes ?? null,
                          vendorService: { connect: { id: s.vendorServiceId } },
                        };
                      }),
                    },
                  },

                  update: {
                    user: { connect: { id: userId } },

                    events: {
                      upsert: weddingPlan.events?.map((e: any) => ({
                        where: { id: e.id || '' },
                        update: {
                          name: e.name,
                          date: new Date(e.date),
                          startTime: e.startTime,
                          endTime: e.endTime,
                          user: { connect: { id: userId } },
                        },
                        create: {
                          name: e.name,
                          date: new Date(e.date),
                          startTime: e.startTime,
                          endTime: e.endTime,
                          user: { connect: { id: userId } },
                        },
                      })),
                    },
                    services: {
                      upsert:
                        weddingPlan.services?.map((s: any) => {
                          const serviceData: any = {
                            quantity: s.quantity ?? 1,
                            notes: s.notes ?? null,
                          };

                          // ✅ only add vendorService relation if provided
                          if (s.vendorServiceId) {
                            serviceData.vendorService = { connect: { id: s.vendorServiceId } };
                          }

                          return {
                            where: { id: s.id || '' },
                            update: { ...serviceData },
                            create: { ...serviceData },
                          };
                        }) ?? [],
                    },
                  },
                },
              },
            },
            include: {
              weddingPlan: {
                include: { events: true, services: true },
              },
            },
          });
        }
      }

      // ✅ Case 2: teamIdsByVendor provided
      else {
        createOrUpdateVendorCardsForLead(lead, { teamIdsByVendor }).catch((error) => {
          logger.error('Failed to create/update vendor cards for updated lead:', error);
        });

        updatedLead = await prisma.lead.update({
          where: { id },
          data: {
            ...rest,
            title,
            description,
            weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
            serviceTypes: serviceTypes || null,
          },
        });
      }

      updatedLead = sanitizeData(updatedLead);
      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, updatedLead, successMessages.LEAD_UPDATED));
    } catch (error) {
      logger.error('Error updating lead:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.LEAD_UPDATE_FAILED)
        );
    }
  }

  public async updateLeadStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      let updatedLead = await prisma.lead.update({
        where: { id },
        data: { status: status },
      });
      updatedLead = sanitizeData(updatedLead);
      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            updatedLead?.status,
            successMessages.LEAD_STATUS_UPDATED || 'Lead status updated successfully'
          )
        );
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.LEAD_NOT_FOUND));
      }

      logger.error('Error updating lead status:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.LEAD_STATUS_UPDATE_FAILED || 'Failed to update lead status'
          )
        );
    }
  }

  public async updateLeadSaveStatus(req: AuthenticatedRequest, res: Response) {
    const archived = req?.query?.archived === 'false' ? false : true;
    try {
      const { id } = req.params;
      const updatedLead = await prisma.lead.update({
        where: { id },
        data: { saveStatus: archived ? 'ARCHIVED' : 'SUBMITTED' },
      });

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            sanitizeData(updatedLead),
            archived ? successMessages.LEAD_ARCHIVED : successMessages.LEAD_RESTORED
          )
        );
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Lead not found'));
      }

      logger.error('Error updating lead archive status:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            archived ? errorMessages.LEAD_ARCHIVE_FAILED : errorMessages.LEAD_RESTORE_FAILED
          )
        );
    }
  }

  public async bulkUpdateLeadStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { ids, status } = req.body;

      const updated = await prisma.lead.updateMany({
        where: { id: { in: ids } },
        data: { status },
      });

      if (updated.count === 0) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(
            new ApiResponse(
              statusCodes.NOT_FOUND,
              null,
              errorMessages.LEAD_NOT_FOUND || 'No leads found for given IDs'
            )
          );
      }

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            { updatedCount: updated.count },
            successMessages.LEAD_STATUS_UPDATED || 'Lead statuses updated successfully'
          )
        );
    } catch (error: any) {
      logger.error('Error updating lead statuses:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.LEAD_STATUS_UPDATE_FAILED || 'Failed to update lead statuses'
          )
        );
    }
  }

  public async exportLeadsWithIdsCsv(req: AuthenticatedRequest, res: Response) {
    try {
      const { ids } = req.body;

      const leads = await prisma.lead.findMany({
        where: {
          id: { in: ids },
        },
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (leads.length === 0) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json({ message: 'No leads found for the given IDs' });
      }

      // Prepare CSV data
      const csvData = leads.map((lead, index) => ({
        SNo: index + 1,
        ID: lead.id,
        Partner1Name: lead.partner1Name,
        Partner2Name: lead.partner2Name || '',
        PrimaryContact: lead.primaryContact,
        PhoneNumber: lead.phoneNumber,
        WhatsappNumber: lead.whatsappNumber || '',
        WhatsappSameAsPhone: lead.whatsappNumberSameAsPhoneNumber ? 'Yes' : 'No',
        Email: lead.email,
        WeddingDate: lead.weddingDate ? lead.weddingDate.toISOString().split('T')[0] : '',
        FlexibleDates: lead.flexibleDates ? 'Yes' : 'No',
        GuestCountMin: lead.guestCountMin || '',
        GuestCountMax: lead.guestCountMax || '',
        BudgetMin: lead.budgetMin,
        BudgetMax: lead.budgetMax,
        PreferredLocations: lead.preferredLocations.join(', '),
        LeadSource: lead.leadSource,
        ReferralDetails: lead.referralDetails || '',
        InitialNotes: lead.initialNotes || '',
        Status: lead.status,
        SaveStatus: lead.saveStatus,
        AssignedTo: lead.createdBy ? `${lead.createdBy.name} (${lead.createdBy.email})` : '',
        CreatedAt: lead.createdAt.toISOString(),
        UpdatedAt: lead.updatedAt.toISOString(),
      }));

      // Convert JSON to CSV
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(csvData);

      res.header('Content-Type', 'text/csv');
      res.attachment(`leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    } catch (error) {
      logger.error('Error exporting leads to CSV:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to export leads' });
    }
  }
}
