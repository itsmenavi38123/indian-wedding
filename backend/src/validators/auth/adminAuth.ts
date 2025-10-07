import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const adminLoginSchema = z.object({
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

export const createAdminSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
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
  countryCode: z.string().optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole),
});

export const emailValidatorSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const verifyOtpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  otp: z.string().min(6, { message: 'OTP must be at least 6 characters long' }),
});

export const resetPasswordSchema = z.object({
  tokenId: z.string(),
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[@$!%*?&_\-]/, {
      message: 'Password must contain at least one special character (@$!%*?&_ -)',
    }),
});
