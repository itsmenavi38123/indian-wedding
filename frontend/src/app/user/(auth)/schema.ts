import { z } from 'zod';

export const userLoginSchema = z.object({
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

export type UserLoginInput = z.infer<typeof userLoginSchema>;

export const signUpSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
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
    confirmPassword: z.string(),
    phone: z.string().optional(),
    countryCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

export type UserSignUpInput = z.infer<typeof signUpSchema>;
