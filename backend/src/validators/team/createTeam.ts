import { z } from 'zod';

export const createTeamSchema = z.object({
  vendorId: z.string().uuid('Invalid vendorId'), // must be a UUID
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').optional(),
  description: z.string().optional(),
});

export const createTeamMemberSchema = z.object({
  vendorId: z.string().uuid('Invalid vendorId'),
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
  avatar: z.any().nullable().optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  teamIds: z.array(z.string().uuid()).optional(),
});

export const updateTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  role: z.string().optional(),
  avatar: z.any().nullable().optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  teamIds: z.array(z.string().uuid()).optional(),
});
