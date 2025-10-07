import { SERVICE_TYPE_VALUES } from '@/types/lead/Lead';
import { z } from 'zod';

export const vendorLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[@$!%*?&_\-]/, {
      message: 'Password must contain at least one special character (@ $ ! % * ? & _ -)',
    }),

  rememberMe: z.boolean(),
});
export type VendorLoginInput = z.infer<typeof vendorLoginSchema>;

export const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[@$!%*?&_\-]/, {
      message: 'Password must contain at least one special character (@ $ ! % * ? & _ -)',
    }),
  serviceTypes: z.array(z.enum(SERVICE_TYPE_VALUES)).min(1, 'Select at least one service type'),
  minimumAmount: z
    .number('Minimum must be a number')
    .nonnegative('Minimum budget must be positive'),
  maximumAmount: z
    .number('Maximum must be a number')
    .nonnegative('Maximum budget must be positive'),
  countryCode: z.string().min(1, 'Country code is required'),
  contactNo: z.string().min(8, 'Contact number is too short'),
});

export type VendorInput = z.infer<typeof vendorSchema>;

export type VendorApiPayload = Omit<VendorInput, 'serviceTypes'> & {
  serviceTypes: string;
};
