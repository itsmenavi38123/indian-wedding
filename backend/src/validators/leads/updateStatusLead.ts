import { LeadStatus } from '@prisma/client';
import { z } from 'zod';

export const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus, {
    errorMap: () => ({ message: 'Invalid lead status' }),
  }),
});

export const bulkUpdateLeadStatusSchema = z.object({
  ids: z
    .array(z.string().min(1, 'Lead ID cannot be empty'))
    .nonempty('IDs array is required and cannot be empty'),
  status: z.string().min(1, 'Status is required'),
});
