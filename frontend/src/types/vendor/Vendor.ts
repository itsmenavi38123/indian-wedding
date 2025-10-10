import { z } from 'zod';

// Vendor interface
export interface Vendor {
  id: string;
  name: string;
  email: string;
  password?: string;
  contactNo: string;
  countryCode: string;
  serviceTypes: string;
  minimumAmount: number;
  maximumAmount: number;
  role?: 'VENDOR' | 'ADMIN' | string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  refreshToken?: string;
  teams?: any[];
  teamMembers?: any[];
  cards?: any[];
}

// Team member schema
export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name required'),
  role: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.any().nullable().optional(),
});

// Team schema
export const teamSchema = z.object({
  name: z.string().min(1, 'Team name required'),
  description: z.string().optional(),
  members: z.array(teamMemberSchema).optional(),
});

// Vendor add schema
export const vendorSchemaAdd = z.object({
  name: z.string().min(1, 'Vendor name required'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase')
    .regex(/[a-z]/, 'Password must contain a lowercase')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[@$!%*?&_\-]/, 'Password must contain a special char'),
  contactNo: z.string().min(5, 'Phone required'),
  countryCode: z.string().min(1, 'Country code required'),
  serviceTypes: z.string().min(1, 'Select at least one service type'),
  minimumAmount: z.number().min(0, 'Minimum amount required'),
  maximumAmount: z.number().min(0, 'Maximum amount required'),
  isActive: z.boolean().optional(),
  teams: z.array(teamSchema).optional(),
});

export const vendorSchemaEdit = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().optional(), // <-- make optional
  contactNo: z.string().nonempty({ message: 'Phone is required' }),
  countryCode: z.string(),
  serviceTypes: z.string(),
  minimumAmount: z.number().min(0, { message: 'Minimum amount must be >= 0' }),
  maximumAmount: z.number().min(0, { message: 'Maximum amount must be >= 0' }),
  isActive: z.boolean(),
  teams: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        members: z.array(z.any()),
      })
    )
    .optional(),
});

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
  thumbnail: z.any().optional(),
  media: z.array(z.any()).optional(),
});

// Types
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Team = z.infer<typeof teamSchema>;
export type VendorFormValuesAdd = z.infer<typeof vendorSchemaAdd>;
export type VendorFormValuesEdit = z.infer<typeof vendorSchemaEdit>;
type VendorFormValues = VendorFormValuesAdd | VendorFormValuesEdit;
export type VendorServiceFormData = z.infer<typeof vendorServiceSchema>;

// Props for form
export type TeamFieldsProps = {
  teamIndex: number;
  removeTeam: (index: number) => void;
};

export interface VendorFormProps {
  defaultValues?: VendorFormValues;
  type?: 'add' | 'edit' | 'view';
  vendorId?: string;
  readOnly?: boolean;
}
