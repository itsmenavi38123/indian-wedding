import { z } from 'zod';

const ProposalServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  order: z.number().optional(),
});

const ProposalCustomLineSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const createProposalSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  reference: z.string().min(1, 'Reference is required'),
  title: z.string().min(1, 'Title is required'),
  template: z.enum(['classic', 'modern', 'traditional', 'scratch']),
  companyName: z.string().min(1, 'Company name is required'),
  logoUrl: z.string().url().optional().or(z.string().length(0)),
  dateISO: z.string().min(1, 'Date is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email().optional().or(z.string().length(0)),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  introHTML: z.string().min(1, 'Introduction is required'),
  termsText: z.string().min(1, 'Terms text is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  taxesPercent: z.number().min(0).max(100).default(18),
  discount: z.number().min(0).default(0),
  services: z.array(ProposalServiceSchema).optional(),
  customLines: z.array(ProposalCustomLineSchema).optional(),
});
