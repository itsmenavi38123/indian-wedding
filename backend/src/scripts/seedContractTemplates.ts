import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedContractTemplates() {
  try {
    console.log('Starting contract template seeding...');

    const contractTemplatePath = path.join(__dirname, '../lib/templates/contract.html');

    const contractHTML = fs.readFileSync(contractTemplatePath, 'utf-8');
    const contractTemplates = [
      {
        templateId: 'wedding_standard_contract',
        name: 'Standard Wedding Contract',
        description: 'Default legal and planning agreement for weddings.',
        htmlContent: contractHTML,
        type: 'contract',
        isSystem: true,
      },
    ];

    for (const template of contractTemplates) {
      const exists = await prisma.contractTemplate.findUnique({
        where: { templateId: template.templateId },
      });

      if (exists) {
        console.log(`Contract '${template.name}' already exists, skipping...`);
      } else {
        await prisma.contractTemplate.create({ data: template });
        console.log(`Created contract template: ${template.name}`);
      }
    }

    console.log('Contract template seeding completed successfully!');
  } catch (error) {
    console.error(' Error seeding contract templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedContractTemplates();
