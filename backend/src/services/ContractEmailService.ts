import { emailService } from './email.service';
import { logger } from '@/logger';

interface ContractTemplateData {
  id: string;
  name: string;
  companyName?: string;
}

export class ContractEmailService {
  public async sendSignatureInvites(
    contract: ContractTemplateData,
    signers: { email: string; label: string }[]
  ): Promise<void> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      for (const signer of signers) {
        const contractUrl = `${frontendUrl}/contracts/${contract.id}`;

        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Contract Signature Invitation</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 30px auto;
                background: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              .header {
                background: #007bff;
                color: #fff;
                padding: 20px;
                text-align: center;
              }
              .header h2 {
                margin: 0;
                font-size: 22px;
              }
              .content {
                padding: 30px;
              }
              .content h3 {
                color: #2c3e50;
                margin-top: 0;
              }
              .button {
                display: inline-block;
                background: #007bff;
                color: #fff;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 5px;
                font-weight: bold;
                margin-top: 20px;
              }
              .button:hover {
                background: #0056b3;
              }
              .footer {
                text-align: center;
                padding: 20px;
                font-size: 13px;
                color: #777;
                border-top: 1px solid #eee;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>${contract.companyName || 'Indian Wedding Contracts'}</h2>
              </div>
              <div class="content">
                <h3>Hello ${signer.label},</h3>
                <p>
                  You’ve been invited to review and sign the contract
                  <strong>${contract.name}</strong>.
                </p>
                <p>
                  Click below to open the contract and complete your signature.
                </p>
                <p style="text-align:center;">
                  <a href="${contractUrl}" class="button">View & Sign Contract</a>
                </p>
                <p>If you have any questions, feel free to reach out to us.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} ${contract.companyName || 'Indian Wedding Contracts'}.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const success = await emailService.sendEmail({
          to: signer.email,
          subject: `Signature Request: ${contract.name}`,
          html,
        });

        if (success) {
          logger.info(`Signature invitation sent to ${signer.email}`);
        } else {
          logger.error(`Failed to send invitation to ${signer.email}`);
        }
      }
    } catch (error) {
      logger.error('Error sending signature invitation emails:', error);
      throw error;
    }
  }
}

export const contractEmailService = new ContractEmailService();
