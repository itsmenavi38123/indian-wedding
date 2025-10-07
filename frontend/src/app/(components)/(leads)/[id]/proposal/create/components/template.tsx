export type ProposalTemplateId = 'classic' | 'modern' | 'traditional' | 'scratch';

export const TEMPLATE_LABELS: Record<ProposalTemplateId, { name: string; description: string }> = {
  classic: { name: 'Classic Elegant', description: 'Timeless typography and structure' },
  modern: { name: 'Modern Minimal', description: 'Clean layout with bold headings' },
  traditional: { name: 'Traditional Indian', description: 'Cultural motifs and respectful tone' },
  scratch: { name: 'Start from Scratch', description: 'Blank canvas to customize' },
};

export const TEMPLATE_CONTENT: Record<
  ProposalTemplateId,
  {
    introHTML: string;
    termsText: string;
    defaultServices: { name: string; description: string; price: number }[];
  }
> = {
  classic: {
    introHTML:
      '<p>Dear {couple_names},</p><p>Thank you for considering us to be part of your special day on {wedding_date}. We are delighted to present this proposal tailored to your preferences.</p>',
    termsText:
      'Terms & Conditions:\n- Quotation valid for 14 days.\n- 50% advance to confirm the booking.\n- Balance due 7 days before {wedding_date}.\n- All prices include GST where applicable.\n',
    defaultServices: [
      { name: 'Photography (Full Day)', description: 'Lead + assistant, edits', price: 45000 },
      { name: 'Cinematography', description: 'Highlights + full film', price: 60000 },
    ],
  },
  modern: {
    introHTML:
      '<p>Hi {couple_names},</p><p>Here’s a streamlined proposal for your wedding on {wedding_date}. We focus on clarity, deliverables, and exceptional value.</p>',
    termsText:
      'Terms & Conditions:\n- Payment schedule: 50% to book, 30% mid-way, 20% on delivery.\n- Rescheduling subject to availability.\n- GST 18% applies where applicable.\n',
    defaultServices: [{ name: 'Core Coverage', description: 'Photo + Film bundle', price: 95000 }],
  },
  traditional: {
    introHTML:
      '<p>Namaste {couple_names},</p><p>It is our honor to present this proposal for your auspicious wedding on {wedding_date}. We respect traditions while crafting timeless memories.</p>',
    termsText:
      'Terms & Conditions:\n- 60% advance for date blocking.\n- Outstation travel and stay (if any) extra at actuals.\n- Taxes as applicable.\n',
    defaultServices: [
      { name: 'Mehendi Coverage', description: 'Half-day session', price: 30000 },
      { name: 'Sangeet Coverage', description: 'Evening event', price: 40000 },
    ],
  },
  scratch: {
    introHTML: '',
    termsText: 'Terms & Conditions:\n',
    defaultServices: [],
  },
};
