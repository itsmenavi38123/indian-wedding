import { z } from 'zod';

export const exportLeadsWithIdsCsvSchema = z.object({
  ids: z
    .array(z.string().min(1, 'Lead ID cannot be empty'))
    .nonempty('IDs array is required and cannot be empty'),
});
