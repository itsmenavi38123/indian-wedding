import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { statusCodes } from '@/constant';
import { logger } from '@/logger';
import { openAIService } from '@/services/openai.service';

export class VibeManagementController {
  // ================= GENERATE VIBE WITH AI (ADMIN) =================
  public async generateVibeWithAI(req: Request, res: Response) {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Prompt is required'));
      }

      logger.info(`Generating vibe with AI for prompt: ${prompt}`);

      const generatedContent = await openAIService.generateVibeContent(prompt);

      return res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            generated: generatedContent,
            note: 'Review and edit the generated content before saving. You can use the suggested image URL or upload your own.',
          },
          'Vibe content generated successfully'
        )
      );
    } catch (error: any) {
      logger.error(`Error in generateVibeWithAI: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= GENERATE VIBE IMAGE WITH DALL-E (ADMIN - OPTIONAL) =================
  public async generateVibeImage(req: Request, res: Response) {
    try {
      const { imagePrompt } = req.body;

      if (!imagePrompt || typeof imagePrompt !== 'string') {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Image prompt is required'));
      }

      logger.info(`Generating image with DALL-E for prompt: ${imagePrompt}`);

      const imageUrl = await openAIService.generateVibeImage(imagePrompt);

      return res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            imageUrl,
            note: 'DALL-E generated image. This is a temporary URL - download and re-upload to permanent storage.',
          },
          'Image generated successfully'
        )
      );
    } catch (error: any) {
      logger.error(`Error in generateVibeImage: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= ENHANCE DESCRIPTION WITH AI (ADMIN) =================
  public async enhanceDescription(req: Request, res: Response) {
    try {
      const { description } = req.body;

      if (!description || typeof description !== 'string') {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Description is required'));
      }

      logger.info(`Enhancing description with AI`);

      const enhancedDescription = await openAIService.enhanceDescription(description);

      return res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            original: description,
            enhanced: enhancedDescription,
          },
          'Description enhanced successfully'
        )
      );
    } catch (error: any) {
      logger.error(`Error in enhanceDescription: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }
  // ================= CREATE VIBE (ADMIN) =================
  public async createVibe(req: Request, res: Response) {
    try {
      const { name, tagline, image, description, order, isActive } = req.body;

      // Check if vibe with same name already exists
      const existing = await prisma.weddingVibe.findUnique({
        where: { name },
      });

      if (existing) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(statusCodes.BAD_REQUEST, null, 'Vibe with this name already exists')
          );
      }

      const vibe = await prisma.weddingVibe.create({
        data: {
          name,
          tagline,
          image,
          description,
          order: order || 0,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      logger.info(`Vibe created: ${vibe.name}`);

      return res.status(statusCodes.CREATED).json(
        new ApiResponse(
          statusCodes.CREATED,
          {
            vibe,
          },
          'Vibe created successfully'
        )
      );
    } catch (error: any) {
      logger.error(`Error in createVibe: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= UPDATE VIBE (ADMIN) =================
  public async updateVibe(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, tagline, image, description, order, isActive } = req.body;

      // Check if vibe exists
      const existing = await prisma.weddingVibe.findUnique({
        where: { id },
      });

      if (!existing) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Vibe not found'));
      }

      // If updating name, check for duplicates
      if (name && name !== existing.name) {
        const duplicate = await prisma.weddingVibe.findUnique({
          where: { name },
        });

        if (duplicate) {
          return res
            .status(statusCodes.BAD_REQUEST)
            .json(
              new ApiResponse(statusCodes.BAD_REQUEST, null, 'Vibe with this name already exists')
            );
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (tagline !== undefined) updateData.tagline = tagline;
      if (image !== undefined) updateData.image = image;
      if (description !== undefined) updateData.description = description;
      if (order !== undefined) updateData.order = order;
      if (isActive !== undefined) updateData.isActive = isActive;

      const vibe = await prisma.weddingVibe.update({
        where: { id },
        data: updateData,
      });

      logger.info(`Vibe updated: ${vibe.name}`);

      return res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            vibe,
          },
          'Vibe updated successfully'
        )
      );
    } catch (error: any) {
      logger.error(`Error in updateVibe: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= DELETE VIBE (ADMIN) =================
  public async deleteVibe(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if vibe exists
      const existing = await prisma.weddingVibe.findUnique({
        where: { id },
      });

      if (!existing) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Vibe not found'));
      }

      await prisma.weddingVibe.delete({
        where: { id },
      });

      logger.info(`Vibe deleted: ${existing.name}`);

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, 'Vibe deleted successfully'));
    } catch (error: any) {
      logger.error(`Error in deleteVibe: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= GET VIBE BY ID (PUBLIC) =================
  public async getVibeById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vibe = await prisma.weddingVibe.findUnique({
        where: { id },
      });

      if (!vibe) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Vibe not found'));
      }

      return res.status(statusCodes.OK).json(
        new ApiResponse(statusCodes.OK, {
          vibe,
        })
      );
    } catch (error: any) {
      logger.error(`Error in getVibeById: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= TOGGLE VIBE STATUS (ADMIN) =================
  public async toggleVibeStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vibe = await prisma.weddingVibe.findUnique({
        where: { id },
      });

      if (!vibe) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Vibe not found'));
      }

      const updated = await prisma.weddingVibe.update({
        where: { id },
        data: {
          isActive: !vibe.isActive,
        },
      });

      logger.info(
        `Vibe status toggled: ${updated.name} - ${updated.isActive ? 'active' : 'inactive'}`
      );

      return res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            vibe: updated,
          },
          `Vibe ${updated.isActive ? 'activated' : 'deactivated'} successfully`
        )
      );
    } catch (error: any) {
      logger.error(`Error in toggleVibeStatus: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }

  // ================= REORDER VIBES (ADMIN) =================
  public async reorderVibes(req: Request, res: Response) {
    try {
      const { vibes } = req.body; // Array of { id, order }

      if (!Array.isArray(vibes) || vibes.length === 0) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Invalid vibes array'));
      }

      // Update all vibes with new order
      const updatePromises = vibes.map((vibe: { id: string; order: number }) =>
        prisma.weddingVibe.update({
          where: { id: vibe.id },
          data: { order: vibe.order },
        })
      );

      await Promise.all(updatePromises);

      logger.info(`Vibes reordered: ${vibes.length} vibes updated`);

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, 'Vibes reordered successfully'));
    } catch (error: any) {
      logger.error(`Error in reorderVibes: ${error.message}`);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, error.message));
    }
  }
}
