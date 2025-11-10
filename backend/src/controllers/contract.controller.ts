import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
import { statusCodes, successMessages, errorMessages } from '@/constant';
import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import { contractEmailService } from '@/services/ContractEmailService';

export class ContractTemplateController {
  public async getAll(req: Request, res: Response) {
    try {
      const templates = await prisma.contractTemplate.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, templates, successMessages.TEMPLATES_FETCHED));
    } catch (error) {
      logger.error('Error fetching contract templates:', error);
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
  public async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await prisma.contractTemplate.findUnique({
        where: { templateId: id },
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
      logger.error('Error fetching contract template:', error);
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
  public async generatePdf(req: Request, res: Response) {
    try {
      console.log('🟢 [generatePdf] Starting contract PDF generation...');

      const { id } = req.params;
      const { coupleNames, weddingDate, venue } = req.query;
      console.log('📩 Params received:', { id, coupleNames, weddingDate, venue });
      console.log('🔍 Fetching contract template from DB...');
      const template = await prisma.contractTemplate.findUnique({
        where: { templateId: id },
      });

      if (!template) {
        console.log('❌ Template not found in DB for ID:', id);
        return res
          .status(statusCodes.NOT_FOUND)
          .json(new ApiResponse(statusCodes.NOT_FOUND, null, 'Contract template not found'));
      }
      console.log('✅ Template found:', template.name);
      console.log('🧱 HTML content length:', template.htmlContent?.length);
      console.log('🧩 Replacing placeholders in HTML...');
      const html = template.htmlContent
        .replace(/{couple_names}/g, String(coupleNames ?? 'John & Jane'))
        .replace(/{wedding_date}/g, String(weddingDate ?? '2025-12-12'))
        .replace(/{venue}/g, String(venue ?? 'The Grand Palace'));

      console.log('🧱 Final HTML prepared, length:', html.length);
      console.log('🚀 Launching Puppeteer browser...');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      console.log('✅ Puppeteer launched successfully');

      const page = await browser.newPage();
      console.log('📄 New page created');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('🧾 HTML content loaded into Puppeteer');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });
      console.log('🖨️ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

      await browser.close();
      console.log('🧹 Puppeteer browser closed');
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="contract-${id}.pdf"`,
      });
      console.log('📤 Sending PDF response to client...');
      res.send(pdfBuffer);

      console.log('✅ [generatePdf] PDF sent successfully!');
    } catch (error: any) {
      console.error('❌ [generatePdf] Error generating PDF:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to generate PDF'));
    }
  }

  public async saveSignatureFields(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fields, emails } = req.body;
      if (!fields || !Array.isArray(fields) || fields.length === 0) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(new ApiResponse(statusCodes.BAD_REQUEST, null, 'Signature fields are required.'));
      }
      if (!emails || !Array.isArray(emails) || emails.length !== 3) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(statusCodes.BAD_REQUEST, null, 'Three signer emails are required.')
          );
      }
      const updatedTemplate = await prisma.contractTemplate.update({
        where: { templateId: id },
        data: {
          signatureFields: fields,
        },
      });
      const signerData = emails.map((email, index) => ({
        email,
        label: `Signer ${index + 1}`,
      }));

      await contractEmailService.sendSignatureInvites(
        {
          id,
          name: updatedTemplate.name,
          companyName: 'Indian Wedding Contracts',
        },
        signerData
      );

      res.status(statusCodes.OK).json(
        new ApiResponse(
          statusCodes.OK,
          {
            template: updatedTemplate,
            signers: signerData,
          },
          'Signature fields saved and emails sent successfully.'
        )
      );
    } catch (error: any) {
      logger.error('Error saving signature fields:', error);
      res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            `Failed to save signature fields: ${error.message}`
          )
        );
    }
  }

  public async createTemplate(req: Request, res: Response) {
    try {
      const { name, description, htmlContent, signatureFields } = req.body;

      if (!name || !htmlContent) {
        return res
          .status(statusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(
              statusCodes.BAD_REQUEST,
              null,
              'Template name and HTML content are required.'
            )
          );
      }

      const newTemplate = await prisma.contractTemplate.create({
        data: {
          templateId: uuidv4(), // ✅ generate unique ID
          name,
          description: description || '',
          htmlContent,
          signatureFields: signatureFields || [],
          isSystem: false,
        },
      });

      res
        .status(statusCodes.CREATED)
        .json(new ApiResponse(statusCodes.CREATED, newTemplate, successMessages.TEMPLATE_CREATED));
    } catch (error: any) {
      logger.error('Error creating contract template:', error);
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
}
