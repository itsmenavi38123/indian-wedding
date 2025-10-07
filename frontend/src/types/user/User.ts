export type UserRole = 'ADMIN' | 'PLANNER' | 'USER' | 'VENDOR';

export const USER_ROLES_VALUES: UserRole[] = ['ADMIN', 'PLANNER', 'USER', 'VENDOR'] as const;

export type Admin = {
  id: string;
  name: string;
  email: string;
  countryCode?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Vendor = {
  name: string;
  email: string;
  password: string;
  countryCode: string;
  contactNo: string;
  minimumAmount: number | string;
  maximumAmount: number | string;
  serviceTypes: string;
  isActive?: boolean;
};

export type User = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
