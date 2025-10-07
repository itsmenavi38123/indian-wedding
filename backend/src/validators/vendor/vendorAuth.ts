import { z } from 'zod';

const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.any().nullable().optional(),
});

const teamSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  members: z.array(teamMemberSchema).optional(),
});

export const vendorLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[@$!%*?&_\-]/, {
      message: 'Password must contain at least one special character (@$!%*?&_ -)',
    }),
  rememberMe: z.boolean(),
});

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[@$!%*?&_\-]/, {
      message: 'Password must contain at least one special character (@$!%*?&_ -)',
    }),
  contactNo: z.string().min(10, 'Contact number is required'),
  serviceTypes: z.string().optional(),
  minimumAmount: z.number().optional(),
  maximumAmount: z.number().optional(),
  countryCode: z.string().min(1, 'Country Code'),
  teams: z.array(teamSchema).optional(),
});

export const updateVendorSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[@$!%*?&_\-]/, {
      message: 'Password must contain at least one special character (@ $ ! % * ? & _ -)',
    })
    .optional(),
  contactNo: z.string().min(10, 'Contact number must be at least 10 digits').optional(),
  serviceTypes: z.string().optional(),
  minimumAmount: z.number().optional(),
  maximumAmount: z.number().optional(),
  countryCode: z.string().min(1, 'Country Code is required').optional(),
  teams: z.array(teamSchema).optional(),
});
