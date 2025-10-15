import { z } from 'zod';

// ================= CREATE/UPDATE VENDOR SERVICE SCHEMA =================
export const vendorServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(1, 'Price must be positive'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  name: z.string().min(1, 'Vendor name is required'),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  thumbnail: z.any().optional(), // can be File or URL string
  media: z.array(z.any()).optional(), // array of Files or URLs
  removeMediaIds: z.array(z.string()).optional(),
});

export type VendorServiceFormData = z.infer<typeof vendorServiceSchema>;
