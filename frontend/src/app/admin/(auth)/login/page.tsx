'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminLogin } from '@/services/api/auth';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setAdminLoginEmail } from '@/store/slices/auth';
import { LoginForm } from '@/app/(components)/LoginForm';

const adminLoginSchema = z.object({
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

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { adminLoginEmail } = useSelector((state: RootState) => state.auth);
  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: adminLoginEmail || '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = form.watch('email');
  useEffect(() => {
    if (emailValue !== adminLoginEmail) {
      dispatch(setAdminLoginEmail(emailValue));
    }
  }, [emailValue, dispatch, adminLoginEmail]);

  const {
    isPending,
    mutate: LoginMutate,
    error,
  } = useMutation({
    mutationFn: async (data: AdminLoginInput) => adminLogin(data),
    onSuccess: (data: any) => {
      toast.success(data?.message ?? 'Admin logged in successfully.');
      dispatch(setAdminLoginEmail(data?.data?.admin?.email));
      router.push('/admin/leads');
    },

    onError: (error) => {
      console.log(error);
      toast.error('Login failed. Please check your credentials and try again.');
    },
  });

  const onSubmit = (data: AdminLoginInput) => {
    LoginMutate(data);
  };

  return (
    <LoginForm
      schema={adminLoginSchema}
      heading="Welcome Back"
      forgotPasswordPath="/admin/forgot-password"
      onSubmit={onSubmit}
      isPending={isPending}
      error={error}
      signUpPath="/admin/signup"
    />
  );
};

export default LoginPage;
