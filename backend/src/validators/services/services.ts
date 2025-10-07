import { z } from 'zod';
import { MediaType } from '@prisma/client';

// ================= CREATE SERVICE SCHEMA =================
export const createServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional(),
  city: z.string().optional(),
  name: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Thumbnail and media are optional, as they may come from req.files
  thumbnail: z.string().url('Thumbnail must be a valid URL').optional(),
  media: z
    .array(
      z.object({
        type: z.nativeEnum(MediaType),
        url: z.string().url('Media URL must be valid'),
      })
    )
    .optional(),
});

// ================= UPDATE SERVICE SCHEMA (like create) =================
export const updateServiceSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().positive().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  name: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  thumbnail: z.string().url('Thumbnail must be a valid URL').optional(),
  media: z
    .array(
      z.object({
        type: z.nativeEnum(MediaType),
        url: z.string().url('Media URL must be valid'),
      })
    )
    .optional(),
  removeMediaIds: z.array(z.string()).optional(),
});
