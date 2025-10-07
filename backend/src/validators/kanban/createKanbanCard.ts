import { z } from 'zod';

export const createKanbanCardSchema = z.object({
  userId: z.string().uuid().optional(),
  brideName: z.string().min(1, 'Bride name is required'),
  groomName: z.string().min(1, 'Groom name is required'),
  weddingDate: z.string().optional(),
  budget: z.number().positive().optional(),
  stageIndicator: z
    .object({
      currentStage: z.enum(['INQUIRY', 'PROPOSAL', 'BOOKED', 'COMPLETED']),
      days: z.number().int().min(0).optional(),
    })
    .optional(),
  teamMemberIds: z.array(z.string().uuid()).optional(),
  description: z.string().optional(),
});

export type CreateKanbanCardInput = z.infer<typeof createKanbanCardSchema>;
