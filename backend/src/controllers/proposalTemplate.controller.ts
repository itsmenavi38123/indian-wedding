import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
import { statusCodes, errorMessages, successMessages } from '@/constant';

export class ProposalTemplateController {
  public async getAllTemplates(req: Request, res: Response) {
    try {
      const templates = await prisma.proposalTemplate.findMany({
        where: { isActive: true },
        include: {
          defaultServices: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      logger.info('Error fetching template:', templates);
      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, templates, successMessages.TEMPLATES_FETCHED));
    } catch (error) {
      logger.error('Error fetching templates:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEMPLATES_FETCH_FAILED
          )
        );
    }
  }

  public async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await prisma.proposalTemplate.findUnique({
        where: { templateId: id },
        include: {
          defaultServices: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!template) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEMPLATE_NOT_FOUND));
      }

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, template, successMessages.TEMPLATE_FETCHED));
    } catch (error) {
      logger.error('Error fetching template:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEMPLATES_FETCH_FAILED
          )
        );
    }
  }

  public async createTemplate(req: Request, res: Response) {
    try {
      const { templateId, name, description, introHTML, termsText, defaultServices } = req.body;

      const template = await prisma.proposalTemplate.create({
        data: {
          templateId,
          name,
          description,
          introHTML,
          termsText,
          isSystem: false,
          defaultServices: {
            create: defaultServices?.map((service: any, index: number) => ({
              name: service.name,
              description: service.description,
              price: service.price,
              order: index,
            })),
          },
        },
        include: {
          defaultServices: true,
        },
      });

      logger.info(`✅ Template created successfully with ID: ${template.id}`);

      res
        .status(statusCodes.CREATED)
        .json(new ApiResponse(statusCodes.CREATED, template, successMessages.TEMPLATE_CREATED));
    } catch (error) {
      logger.error('Error creating template:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEMPLATE_CREATE_FAILED
          )
        );
    }
  }

  public async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, introHTML, termsText, defaultServices } = req.body;

      const existingTemplate = await prisma.proposalTemplate.findUnique({
        where: { templateId: id },
      });

      if (!existingTemplate) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEMPLATE_NOT_FOUND));
      }

      if (existingTemplate.isSystem) {
        return res
          .status(statusCodes.FORBIDDEN)
          .json(
            new ApiResponse(
              statusCodes.FORBIDDEN,
              null,
              errorMessages.CANNOT_MODIFY_SYSTEM_TEMPLATE
            )
          );
      }

      await prisma.proposalTemplateService.deleteMany({
        where: { templateId: existingTemplate.id },
      });

      const template = await prisma.proposalTemplate.update({
        where: { templateId: id },
        data: {
          name,
          description,
          introHTML,
          termsText,
          defaultServices: {
            create: defaultServices?.map((service: any, index: number) => ({
              name: service.name,
              description: service.description,
              price: service.price,
              order: index,
            })),
          },
        },
        include: {
          defaultServices: true,
        },
      });

      logger.info(`✅ Template updated successfully: ${template.templateId}`);

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, template, successMessages.TEMPLATE_UPDATED));
    } catch (error) {
      logger.error('Error updating template:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEMPLATE_UPDATE_FAILED
          )
        );
    }
  }

  public async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await prisma.proposalTemplate.findUnique({
        where: { templateId: id },
      });

      if (!template) {
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, errorMessages.TEMPLATE_NOT_FOUND));
      }

      if (template.isSystem) {
        return res
          .status(statusCodes.FORBIDDEN)
          .json(
            new ApiResponse(
              statusCodes.FORBIDDEN,
              null,
              errorMessages.CANNOT_DELETE_SYSTEM_TEMPLATE
            )
          );
      }

      await prisma.proposalTemplate.update({
        where: { templateId: id },
        data: { isActive: false },
      });

      logger.info(`✅ Template deleted successfully: ${id}`);

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.TEMPLATE_DELETED));
    } catch (error) {
      logger.error('Error deleting template:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEMPLATE_DELETE_FAILED
          )
        );
    }
  }

  public async seedDefaultTemplates(req: Request, res: Response) {
    try {
      const defaultTemplates = [
        {
          templateId: 'classic',
          name: 'Classic Elegant',
          description: 'Timeless typography and structure',
          introHTML:
            '<p>Dear {couple_names},</p><p>Thank you for considering us to be part of your special day on {wedding_date}. We are delighted to present this proposal tailored to your preferences.</p>',
          termsText:
            'Terms & Conditions:\n- Quotation valid for 14 days.\n- 50% advance to confirm the booking.\n- Balance due 7 days before {wedding_date}.\n- All prices include GST where applicable.\n',
          isSystem: true,
          defaultServices: {
            create: [
              {
                name: 'Photography (Full Day)',
                description: 'Lead + assistant, edits',
                price: 45000,
                order: 0,
              },
              {
                name: 'Cinematography',
                description: 'Highlights + full film',
                price: 60000,
                order: 1,
              },
            ],
          },
        },
        {
          templateId: 'modern',
          name: 'Modern Minimal',
          description: 'Clean layout with bold headings',
          introHTML:
            "<p>Hi {couple_names},</p><p>Here's a streamlined proposal for your wedding on {wedding_date}. We focus on clarity, deliverables, and exceptional value.</p>",
          termsText:
            'Terms & Conditions:\n- Payment schedule: 50% to book, 30% mid-way, 20% on delivery.\n- Rescheduling subject to availability.\n- GST 18% applies where applicable.\n',
          isSystem: true,
          defaultServices: {
            create: [
              { name: 'Core Coverage', description: 'Photo + Film bundle', price: 95000, order: 0 },
            ],
          },
        },
        {
          templateId: 'traditional',
          name: 'Traditional Indian',
          description: 'Cultural motifs and respectful tone',
          introHTML:
            '<p>Namaste {couple_names},</p><p>It is our honor to present this proposal for your auspicious wedding on {wedding_date}. We respect traditions while crafting timeless memories.</p>',
          termsText:
            'Terms & Conditions:\n- 60% advance for date blocking.\n- Outstation travel and stay (if any) extra at actuals.\n- Taxes as applicable.\n',
          isSystem: true,
          defaultServices: {
            create: [
              { name: 'Mehendi Coverage', description: 'Half-day session', price: 30000, order: 0 },
              { name: 'Sangeet Coverage', description: 'Evening event', price: 40000, order: 1 },
            ],
          },
        },
        {
          templateId: 'scratch',
          name: 'Start from Scratch',
          description: 'Blank canvas to customize',
          introHTML: '',
          termsText: 'Terms & Conditions:\n',
          isSystem: true,
          defaultServices: {
            create: [],
          },
        },
      ];

      for (const template of defaultTemplates) {
        const exists = await prisma.proposalTemplate.findUnique({
          where: { templateId: template.templateId },
        });

        if (!exists) {
          await prisma.proposalTemplate.create({
            data: template,
          });
        }
      }

      logger.info('✅ Default templates seeded successfully');

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, null, successMessages.TEMPLATES_SEEDED));
    } catch (error) {
      logger.error('Error seeding templates:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            errorMessages.TEMPLATE_SEED_FAILED
          )
        );
    }
  }
}
