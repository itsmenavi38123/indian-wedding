import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTemplates() {
  try {
    console.log('Starting template seeding...');

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

      if (exists) {
        console.log(`Template '${template.name}' already exists, skipping...`);
      } else {
        await prisma.proposalTemplate.create({
          data: template,
        });
        console.log(`Created template: ${template.name}`);
      }
    }

    console.log('Template seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTemplates();
