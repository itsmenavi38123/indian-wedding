import nodemailer from 'nodemailer';
import { logger } from '@/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email configuration is available
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      logger.info('Email service initialized successfully');
    } else {
      logger.warn('Email service not configured. Please set SMTP environment variables.');
    }
  }

  public async sendProposalEmail(
    proposal: any,
    proposalUrl: string,
    customMessage?: string
  ): Promise<boolean> {
    if (!this.transporter) {
      logger.error('Email service not configured');
      return false;
    }

    if (!proposal.clientEmail) {
      logger.error('Client email not provided');
      return false;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Proposal - ${proposal.reference}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 20px;
          }
          h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 24px;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
          }
          .message {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 25px;
          }
          .proposal-details {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
            margin-bottom: 25px;
          }
          .proposal-details h3 {
            margin-top: 0;
            color: #856404;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .detail-label {
            font-weight: bold;
            color: #666;
          }
          .detail-value {
            color: #333;
          }
          .cta-button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .cta-button:hover {
            background-color: #0056b3;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .contact-info {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
          }
          .contact-info p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${proposal.logoUrl ? `<img src="${proposal.logoUrl}" alt="${proposal.companyName}" class="logo">` : ''}
            <h1>${proposal.companyName}</h1>
          </div>
          
          <div class="content">
            <div class="greeting">
              Dear ${proposal.clientName},
            </div>
            
            ${
              customMessage
                ? `<div class="message">${customMessage}</div>`
                : `<div class="message">
                    We are pleased to present our proposal for your upcoming wedding celebration. 
                    We have carefully crafted this proposal to meet your specific requirements and ensure 
                    your special day is truly memorable.
                  </div>`
            }
            
            <div class="proposal-details">
              <h3>Proposal Details</h3>
              <div class="detail-row">
                <span class="detail-label">Reference:</span>
                <span class="detail-value">${proposal.reference}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(proposal.dateISO).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">₹${proposal.grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Terms:</span>
                <span class="detail-value">${proposal.paymentTerms}</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${proposalUrl}" class="cta-button">View Full Proposal</a>
            </div>
            
            <div class="contact-info">
              <p><strong>Questions?</strong> We're here to help!</p>
              <p>Feel free to reach out if you have any questions or would like to discuss the proposal further.</p>
              ${process.env.COMPANY_PHONE ? `<p>Phone: ${process.env.COMPANY_PHONE}</p>` : ''}
              ${process.env.COMPANY_EMAIL ? `<p>Email: ${process.env.COMPANY_EMAIL}</p>` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for considering our services.</p>
            <p>We look forward to being a part of your special celebration!</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              This email contains confidential information intended only for the recipient. 
              If you received this in error, please notify us immediately.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"${proposal.companyName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: proposal.clientEmail,
        subject: `Wedding Proposal - ${proposal.reference}`,
        html: emailHtml,
      });

      logger.info(`Proposal email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending proposal email:', error);
      return false;
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.error('Email service not configured');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        ...options,
      });

      logger.info(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
