import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { emailService } from '@/services/email.service';
import prisma from '@/config/prisma';
import { logger } from '@/logger';
import { ProposalStatus } from '@prisma/client';

export const sendProposalEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { to, cc, subject, message } = req.body;

  if (!to || !/\S+@\S+\.\S+/.test(to)) {
    console.log('Invalid recipient - email');
    return res.status(400).json({ error: 'Valid recipient email is required' });
  }

  let browser;
  try {
    console.log('🔍 Fetching proposal from database...');
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            weddingPlan: true,
          },
        },
      },
    });

    if (!proposal) {
      console.log('Proposal not found');
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const previewUrl = `${process.env.FRONTEND_URL}/proposal/view/${proposal.id}`;
    console.log(' Public Preview URL:', previewUrl);

    if (!process.env.FRONTEND_URL) {
      console.log('FRONTEND_URL not defined in .env');
    }

    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    console.log('Navigating to preview...');
    await page.goto(previewUrl, { waitUntil: 'networkidle0' });
    console.log('Page loaded successfully');

    console.log('Generating full-page PDF...');
    await page.emulateMediaType('screen');

    await page.evaluateHandle('document.fonts.ready');
    await page.waitForFunction('document.readyState === "complete"');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const fullHeight = await page.evaluate(() => document.body.scrollHeight);

    await page.setViewport({ width: 1200, height: fullHeight });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: '1200px',
      height: `${fullHeight}px`,
      preferCSSPageSize: true,
      margin: { top: '20mm', bottom: '20mm', left: '10mm', right: '10mm' },
    });

    console.log('Full-page PDF generated successfully');

    await browser.close();
    console.log('Browser closed');

    const pdfContent = Buffer.from(pdfBuffer);

    console.log('Sending email...');
    await emailService.sendEmail({
      to,
      cc,
      subject: subject || `Wedding Proposal - ${proposal.reference}`,
      html:
        message ||
        `<p>Dear ${proposal.clientName},</p>
         <p>Please find attached your wedding proposal.</p>`,
      attachments: [
        {
          filename: `Proposal-${proposal.reference}.pdf`,
          content: pdfContent,
        },
      ],
    });
    console.log('Email sent successfully');

    await prisma.proposal.update({
      where: { id },
      data: { status: ProposalStatus.SENT, sentAt: new Date() },
    });
    console.log('Proposal status updated to SENT');

    logger.info(`Proposal ${proposal.reference} sent to ${to}`);
    res.json({ success: true, message: 'Proposal sent successfully' });
  } catch (error: any) {
    console.error('Error sending proposal email:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Failed to send proposal email', details: error.message });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
};
