import { LeadSource, SaveStatus } from '@prisma/client';
import { z } from 'zod';

export const createLeadSchema = z.object({
  partner1Name: z.string().optional(),
  partner2Name: z.string().optional(),
  primaryContact: z.string().optional(),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  whatsappNumberSameAsPhoneNumber: z.boolean().optional(),
  email: z.string().email({ message: 'Invalid email' }).or(z.literal('')).optional(),
  flexibleDates: z.boolean().optional(),
  guestCountMin: z.number().optional(),
  guestCountMax: z.number().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  preferredLocations: z.array(z.string()).nonempty('At least one location must be provided'),
  leadSource: z.nativeEnum(LeadSource).optional(),
  referralDetails: z.string().optional(),
  initialNotes: z.string().optional(),
  serviceTypes: z.string().optional(),
  weddingDate: z.string().optional(),
  createdById: z.string().optional(),
  saveStatus: z.nativeEnum(SaveStatus).optional(),
});
