import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
import { errorMessages, statusCodes, successMessages } from '@/constant';
import { LeadStatus } from '@prisma/client';
import { emitPipelineUpdate } from '@/config/socket';

export class PipelineController {
  public async updatePipelineLead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          partner1Name: updateData.partner1Name,
          partner2Name: updateData.partner2Name,
          weddingDate: updateData.weddingDate ? new Date(updateData.weddingDate) : undefined,
          budget: updateData.budget,
          budgetMin: updateData.budgetMin,
          budgetMax: updateData.budgetMax,
          createdById: updateData.createdById,
          status: updateData.status as LeadStatus,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Transform to pipeline format
      const transformedLead = {
        id: updatedLead.id,
        couple: `${updatedLead.partner1Name}${updatedLead.partner2Name ? ' & ' + updatedLead.partner2Name : ''}`,
        weddingDate: updatedLead.weddingDate?.toISOString() || new Date().toISOString(),
        budget:
          updatedLead.budget || Math.floor((updatedLead.budgetMin + updatedLead.budgetMax) / 2),
        stage: updatedLead.status,
        dateInStage: updatedLead.updatedAt.toISOString(),
        assignee: updatedLead.createdBy ? { name: updatedLead.createdBy.name } : undefined,
        archived: false,
      };

      // Emit socket event for real-time update
      emitPipelineUpdate('lead-updated', transformedLead);

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, transformedLead, successMessages.PIPELINE_LEAD_UPDATED)
        );
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.LEAD_NOT_FOUND));
      }

      logger.error('Error updating lead:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PIPELINE_LEAD_UPDATE_FAILED
          )
        );
    }
  }

  public async getPipelineLeads(req: Request, res: Response) {
    try {
      const { assignee, startDate, endDate, minBudget, maxBudget, status } = req.query;

      // Build where clause with filters
      const where: any = {
        saveStatus: { not: 'ARCHIVED' },
      };

      // Filter by assignee
      if (assignee && assignee !== 'all') {
        if (assignee === 'Unassigned') {
          where.createdById = null;
        } else {
          where.createdBy = {
            name: String(assignee),
          };
        }
      }

      // Filter by wedding date range
      if (startDate) {
        where.weddingDate = {
          ...where.weddingDate,
          gte: new Date(String(startDate)),
        };
      }
      if (endDate) {
        where.weddingDate = {
          ...where.weddingDate,
          lte: new Date(String(endDate)),
        };
      }

      // Filter by budget range
      if (minBudget) {
        where.OR = [
          { budget: { gte: Number(minBudget) } },
          {
            AND: [{ budget: null }, { budgetMin: { gte: Number(minBudget) } }],
          },
        ];
      }
      if (maxBudget) {
        if (where.OR) {
          // If minBudget filter exists, combine with AND
          where.AND = [
            { OR: where.OR },
            {
              OR: [
                { budget: { lte: Number(maxBudget) } },
                {
                  AND: [{ budget: null }, { budgetMax: { lte: Number(maxBudget) } }],
                },
              ],
            },
          ];
          delete where.OR;
        } else {
          where.OR = [
            { budget: { lte: Number(maxBudget) } },
            {
              AND: [{ budget: null }, { budgetMax: { lte: Number(maxBudget) } }],
            },
          ];
        }
      }

      // Filter by status
      if (status && status !== 'all') {
        where.status = String(status);
      }

      const leads = await prisma.lead.findMany({
        where,
        select: {
          id: true,
          partner1Name: true,
          partner2Name: true,
          weddingDate: true,
          budgetMin: true,
          budgetMax: true,
          budget: true,
          status: true,
          updatedAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Transform leads to match pipeline format
      const transformedLeads = leads.map((lead) => ({
        id: lead.id,
        couple: `${lead.partner1Name}${lead.partner2Name ? ' & ' + lead.partner2Name : ''}`,
        weddingDate: lead.weddingDate?.toISOString() || new Date().toISOString(),
        budget: lead.budget || Math.floor((lead.budgetMin + lead.budgetMax) / 2),
        stage: lead.status, // Using status field directly
        dateInStage: lead.updatedAt.toISOString(),
        assignee: lead.createdBy ? { name: lead.createdBy.name } : undefined,
        archived: false,
      }));

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, transformedLeads, successMessages.PIPELINE_LEADS_FETCHED)
        );
    } catch (error) {
      logger.error('Error fetching pipeline leads:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PIPELINE_LEADS_FETCH_FAILED
          )
        );
    }
  }

  public async updatePipelineLeadStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status is a valid LeadStatus enum value
      if (!Object.values(LeadStatus).includes(status)) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, errorMessages.INVALID_STATUS_VALUE));
      }

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          status: status as LeadStatus,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const transformedLead = {
        id: updatedLead.id,
        couple: `${updatedLead.partner1Name}${updatedLead.partner2Name ? ' & ' + updatedLead.partner2Name : ''}`,
        weddingDate: updatedLead.weddingDate?.toISOString() || new Date().toISOString(),
        budget:
          updatedLead.budget || Math.floor((updatedLead.budgetMin + updatedLead.budgetMax) / 2),
        stage: updatedLead.status, // Using status field
        dateInStage: updatedLead.updatedAt.toISOString(),
        assignee: updatedLead.createdBy ? { name: updatedLead.createdBy.name } : undefined,
        archived: false,
      };

      // Emit socket event for real-time status update
      emitPipelineUpdate('lead-status-updated', transformedLead);

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(
            statusCodes.OK,
            transformedLead,
            successMessages.PIPELINE_LEAD_STATUS_UPDATED
          )
        );
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.LEAD_NOT_FOUND));
      }

      logger.error('Error updating lead stage:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PIPELINE_LEAD_STATUS_UPDATE_FAILED
          )
        );
    }
  }

  public async archivePipelineLead(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          saveStatus: 'ARCHIVED',
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const transformedLead = {
        id: updatedLead.id,
        couple: `${updatedLead.partner1Name}${updatedLead.partner2Name ? ' & ' + updatedLead.partner2Name : ''}`,
        weddingDate: updatedLead.weddingDate?.toISOString() || new Date().toISOString(),
        budget:
          updatedLead.budget || Math.floor((updatedLead.budgetMin + updatedLead.budgetMax) / 2),
        stage: updatedLead.status,
        dateInStage: updatedLead.updatedAt.toISOString(),
        assignee: updatedLead.createdBy ? { name: updatedLead.createdBy.name } : undefined,
        archived: true,
      };

      // Emit socket event for real-time archive update
      emitPipelineUpdate('lead-archived', { id: updatedLead.id });

      res
        .status(statusCodes.OK)
        .json(
          new ApiResponse(statusCodes.OK, transformedLead, successMessages.PIPELINE_LEAD_ARCHIVED)
        );
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.LEAD_NOT_FOUND));
      }

      logger.error('Error archiving lead:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.PIPELINE_LEAD_ARCHIVE_FAILED
          )
        );
    }
  }
}
