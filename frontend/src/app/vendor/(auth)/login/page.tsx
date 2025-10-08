'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVendorLoginEmail } from '@/store/slices/auth';
import { LoginForm } from '@/app/(components)/LoginForm';
import { VendorLoginInput, vendorLoginSchema } from '../schema';
import { vendorLogin } from '@/services/api/vendorAuth';

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { vendorLoginEmail } = useSelector((state: RootState) => state.auth);
  const form = useForm<VendorLoginInput>({
    resolver: zodResolver(vendorLoginSchema),
    defaultValues: {
      email: vendorLoginEmail || '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = form.watch('email');

  useEffect(() => {
    if (emailValue !== vendorLoginEmail) {
      dispatch(setVendorLoginEmail(emailValue));
    }
  }, [emailValue, dispatch, vendorLoginEmail]);

  const {
    isPending,
    mutate: LoginMutate,
    error,
  } = useMutation({
    mutationFn: async (data: VendorLoginInput) => vendorLogin(data),
    onSuccess: (data: any) => {
      if (data?.statusCode) {
        toast.success(data?.message ?? 'Vendor logged in successfully.');
        dispatch(setVendorLoginEmail(''));
        router.push('/vendor/dashboard');
      }
    },
  });

  const onSubmit = (data: VendorLoginInput) => {
    LoginMutate(data);
  };

  return (
    <LoginForm
      schema={vendorLoginSchema}
      heading="Welcome Back, Wedding Planner"
      forgotPasswordPath="/vendor/forgot-password"
      onSubmit={onSubmit}
      isPending={isPending}
      error={error}
      signUpPath="/vendor/signup"
    />
  );
};

export default LoginPage;
