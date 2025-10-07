import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Must contain at least one number' })
    .regex(/[@$!%*?&_\-]/, {
      message: 'Must contain at least one special character (@$!%*?&_-)',
    }),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Must contain at least one number' })
    .regex(/[@$!%*?&_\-]/, {
      message: 'Must contain at least one special character (@$!%*?&_-)',
    })
    .optional(),
});

export const userLoginSchema = z.object({
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
