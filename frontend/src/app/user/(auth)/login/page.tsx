'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { LoginForm } from '@/app/(components)/LoginForm';
import { UserLoginInput, userLoginSchema } from '../schema';
import { setUserLoginEmail } from '@/store/slices/auth';
import { userLogin } from '@/services/api/userAuth';

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { userLoginEmail } = useSelector((state: RootState) => state.auth);
  const redirectTo = searchParams.get('redirect');

  const form = useForm<UserLoginInput>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: userLoginEmail || '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = form.watch('email');

  useEffect(() => {
    if (emailValue !== userLoginEmail) {
      dispatch(setUserLoginEmail(emailValue));
    }
  }, [emailValue, dispatch, userLoginEmail]);

  const {
    isPending,
    mutate: LoginMutate,
    error,
  } = useMutation({
    mutationFn: async (data: UserLoginInput) => userLogin(data),
    onSuccess: (data: any) => {
      if (data?.statusCode) {
        const user = data.data.user;
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          })
        );
        toast.success(data?.message ?? 'User logged in successfully.');
        dispatch(setUserLoginEmail(''));
        if (redirectTo && redirectTo !== '/user/dashboard') {
          router.push(redirectTo);
        } else {
          router.push('/user/dashboard');
        }
      }
    },
  });

  const onSubmit = (data: UserLoginInput) => {
    LoginMutate(data);
  };

  return (
    <>
      <LoginForm
        schema={userLoginSchema}
        heading="Welcome Back"
        forgotPasswordPath="/user/forgot-password"
        onSubmit={onSubmit}
        isPending={isPending}
        error={error}
        signUpPath="/user/signup"
      />
    </>
  );
};

export default LoginPage;
