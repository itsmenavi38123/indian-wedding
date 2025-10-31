import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
import { statusCodes, successMessages, errorMessages } from '@/constant';
import puppeteer from 'puppeteer';

export class ContractTemplateController {
  public async getAll(req: Request, res: Response) {
    try {
      const templates = await prisma.contractTemplate.findMany({
        where: { isSystem: true },
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

      // 1️⃣ Fetch the existing template by its templateId
      console.log('🔍 Fetching contract template from DB...');
      const template = await prisma.contractTemplate.findUnique({
        where: { templateId: id },
      });

      if (!template) {
        console.log('❌ Template not found in DB for ID:', id);
        return res
          .status(statusCodes.NOT_FOUND)
          .json(
            new ApiResponse(
              statusCodes.NOT_FOUND,
              null,
              'Contract template not found'
            )
          );
      }

      console.log('✅ Template found:', template.name);
      console.log('🧱 HTML content length:', template.htmlContent?.length);

      // 2️⃣ Replace placeholders — or use defaults
      console.log('🧩 Replacing placeholders in HTML...');
      const html = template.htmlContent
        .replace(/{couple_names}/g, String(coupleNames ?? 'John & Jane'))
        .replace(/{wedding_date}/g, String(weddingDate ?? '2025-12-12'))
        .replace(/{venue}/g, String(venue ?? 'The Grand Palace'));

      console.log('🧱 Final HTML prepared, length:', html.length);

      // 3️⃣ Use Puppeteer to render HTML → PDF
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

      // 4️⃣ Send PDF as response
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
        .json(
          new ApiResponse(
            statusCodes.INTERNAL_SERVER_ERROR,
            null,
            'Failed to generate PDF'
          )
        );
    }
  }

}
