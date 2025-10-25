'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setTeamMemberLoginEmail } from '@/store/slices/auth';
import { LoginForm } from '@/app/(components)/LoginForm';
import { teamMemberLogin } from '@/services/api/teamMemberAuth';

const teamMemberLoginSchema = z.object({
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

export type TeamMemberLoginInput = z.infer<typeof teamMemberLoginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { teamMemberLoginEmail } = useSelector((state: RootState) => state.auth);
  const form = useForm<TeamMemberLoginInput>({
    resolver: zodResolver(teamMemberLoginSchema),
    defaultValues: {
      email: teamMemberLoginEmail || '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = form.watch('email');
  useEffect(() => {
    if (emailValue !== teamMemberLoginEmail) {
      dispatch(setTeamMemberLoginEmail(emailValue));
    }
  }, [emailValue, dispatch, teamMemberLoginEmail]);

  const {
    isPending,
    mutate: LoginMutate,
    error,
  } = useMutation({
    mutationFn: async (data: TeamMemberLoginInput) => teamMemberLogin(data),
    onSuccess: (data: any) => {
      toast.success(data?.message ?? 'Team member logged in successfully.');
      dispatch(setTeamMemberLoginEmail(''));
      router.push('/team-member/dashboard');
    },
    onError: (error) => {
      console.log(error);
      toast.error('Login failed. Please check your credentials and try again.');
    },
  });

  const onSubmit = (data: TeamMemberLoginInput) => {
    LoginMutate(data);
  };

  return (
    <LoginForm
      schema={teamMemberLoginSchema}
      heading="Welcome Back"
      forgotPasswordPath="/team-member/forgot-password"
      onSubmit={onSubmit}
      isPending={isPending}
      error={error}
    />
  );
};

export default LoginPage;
