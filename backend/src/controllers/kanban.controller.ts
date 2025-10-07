import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import { AuthenticatedVendorRequest } from '@/middlewares/vendorAuthMiddleware';
// import { Response } from 'express';
import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
// import { statusCodes } from '@/constant';
import { CONST_KEYS, cookiesOption, errorMessages, statusCodes, successMessages } from '@/constant';
import { sanitizeData } from '@/services/vendorMatching.service';

export class KanbanController {
  public async updateKanbanCard(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const { cardId } = req.params; // Card id should come from route params
      const vendorId = req.vendorId!; // Get from authenticated request
      const {
        userId,
        brideName,
        groomName,
        weddingDate,
        budget,
        stageIndicator,
        teamMemberIds, // Array of team member IDs to update
        description,
      } = req.body;

      if (!cardId) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Card ID is required'));
      }

      // Find card
      const existingCard = await prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!existingCard) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Card not found'));
      }

      // Authorization check: vendor can only update their own cards
      if (existingCard.vendorId !== vendorId) {
        return res
          .status(statusCodes.FORBIDDEN)
          .json(
            new ApiResponse(
              statusCodes.FORBIDDEN,
              null,
              'You are not authorized to update this card'
            )
          );
      }

      // Validate vendor exists
      const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
      if (!vendor) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Vendor not found'));
      }

      // Validate assigned user if provided
      let assignedUser: any | null = null;
      if (userId) {
        assignedUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!assignedUser) {
          return res
            .status(statusCodes.NOT_FOUND)
            .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Assigned user not found'));
        }
      }

      // Validate team members if provided
      let validTeamMemberIds: string[] = [];
      let teamMemberUpdate = {};

      if (teamMemberIds !== undefined) {
        if (Array.isArray(teamMemberIds) && teamMemberIds.length > 0) {
          // Verify all team members exist and belong to the vendor
          const teamMembers = await prisma.teamMember.findMany({
            where: {
              id: { in: teamMemberIds },
              vendorId: vendorId,
            },
            select: { id: true },
          });

          validTeamMemberIds = teamMembers.map((m) => m.id);

          // Check if any invalid member IDs were provided
          const invalidIds = teamMemberIds.filter((id) => !validTeamMemberIds.includes(id));
          if (invalidIds.length > 0) {
            return res
              .status(statusCodes.BAD_REQUEST)
              .json(
                new ApiResponse(
                  statusCodes.BAD_REQUEST,
                  null,
                  `Invalid team member IDs: ${invalidIds.join(', ')}`
                )
              );
          }
        }

        // Prepare team member update (disconnect all and connect new ones)
        teamMemberUpdate = {
          teamMembers: {
            set: [], // Disconnect all existing
            connect: validTeamMemberIds.map((id) => ({ id })), // Connect new ones
          },
        };
      }

      // Build description if not provided

      // Update card
      const updatedCard = await prisma.card.update({
        where: { id: cardId },
        data: {
          vendorId: vendorId || existingCard.vendorId,
          ...teamMemberUpdate,
        },
        include: {
          vendor: true,
          originalLead: {
            select: {
              id: true,
              partner1Name: true,
              partner2Name: true,
            },
          },
        },
      });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, updatedCard, 'Kanban card updated successfully'));
    } catch (error) {
      logger.error('Error updating kanban card:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to update kanban card')
        );
    }
  }

  public async deleteKanbanCard(req: AuthenticatedVendorRequest, res: Response) {
    try {
      const { cardId } = req.params;
      const vendorId = req.vendorId!;

      if (!cardId) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Card ID is required'));
      }

      // Find card
      const existingCard = await prisma.card.findUnique({
        where: { id: cardId },
      });

      if (!existingCard) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Card not found'));
      }

      // Authorization check: vendor can only delete their own cards
      if (existingCard.vendorId !== vendorId) {
        return res
          .status(statusCodes.FORBIDDEN)
          .json(
            new ApiResponse(
              statusCodes.FORBIDDEN,
              null,
              'You are not authorized to delete this card'
            )
          );
      }

      // Delete the card (will cascade delete team member connections)
      await prisma.card.delete({
        where: { id: cardId },
      });

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.KANBAN_CARD_DELETED));
    } catch (error) {
      logger.error('Error deleting kanban card:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.KANBAN_CARD_DELETE_FAILED
          )
        );
    }
  }

  public async updateCardStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { cardId } = req.params;
      const { kanbanBoardId, teamMembers } = req.body;

      // Map kanban board ID to lead status
      const statusMap: { [key: string]: 'INQUIRY' | 'PROPOSAL' | 'BOOKED' | 'COMPLETED' } = {
        inquiry: 'INQUIRY',
        proposal: 'PROPOSAL',
        booked: 'BOOKED',
        completed: 'COMPLETED',
      };

      const newStatus = statusMap[kanbanBoardId];

      if (!newStatus) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Invalid board ID'));
      }

      // Update the lead status
      const updatedLead = await prisma.lead.update({
        where: { id: cardId },
        data: {
          status: newStatus,
          stage: kanbanBoardId.charAt(0).toUpperCase() + kanbanBoardId.slice(1), // Capitalize first letter
          updatedAt: new Date(), // Reset updatedAt to track days in new stage
        },
        include: {
          createdBy: true,
        },
      });

      // Format the response as a card
      const daysInStage = 0; // Reset to 0 since just moved

      const updatedCard = {
        id: updatedLead.id,
        title: `${updatedLead.partner1Name}${updatedLead.partner2Name ? ' & ' + updatedLead.partner2Name : ''}`,
        description: updatedLead.initialNotes || '',
        kanbanBoardId: kanbanBoardId,
        leadData: {
          partner1Name: updatedLead.partner1Name,
          partner2Name: updatedLead.partner2Name,
          weddingDate: updatedLead.weddingDate,
          budgetMin: updatedLead.budgetMin,
          budgetMax: updatedLead.budgetMax,
          budget: updatedLead.budget,
          phoneNumber: updatedLead.phoneNumber,
          email: updatedLead.email,
          status: updatedLead.status,
          stage: updatedLead.stage,
          daysInStage: daysInStage,
          guestCountMin: updatedLead.guestCountMin,
          guestCountMax: updatedLead.guestCountMax,
          leadSource: updatedLead.leadSource,
          preferredLocations: updatedLead.preferredLocations,
        },
        assignedUser: updatedLead.createdBy
          ? {
              id: updatedLead.createdBy.id,
              name: updatedLead.createdBy.name,
              email: updatedLead.createdBy.email,
            }
          : null,
        teamMembers: [],
        createdAt: updatedLead.createdAt,
        updatedAt: updatedLead.updatedAt,
      };

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, updatedCard, 'Lead status updated successfully'));
    } catch (error) {
      logger.error('Error updating card status:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to update card status')
        );
    }
  }

  public async archiveLead(req: AuthenticatedRequest, res: Response) {
    try {
      const { cardId } = req.params;

      // Archive the lead by updating saveStatus
      const archivedLead = await prisma.lead.update({
        where: { id: cardId },
        data: {
          saveStatus: 'ARCHIVED',
        },
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, archivedLead, 'Lead archived successfully'));
    } catch (error) {
      logger.error('Error archiving lead:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to archive lead'));
    }
  }

  public async deleteKanbanCards(req: AuthenticatedRequest, res: Response) {
    try {
      const { cardId } = req.params;

      // Delete the card
      await prisma.card.delete({
        where: { id: cardId },
      });

      res
        .status(statusCodes.NO_CONTENT)
        .json(new ApiResponse(statusCodes.NO_CONTENT, null, successMessages.KANBAN_CARD_DELETED));
    } catch (error) {
      logger.error('Error deleting card:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.KANBAN_CARD_DELETE_FAILED
          )
        );
    }
  }
}
