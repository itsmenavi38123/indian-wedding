'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { adminForgotPassword } from '@/services/api/auth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setAdminLoginEmail } from '@/store/slices/auth';
import { setEmail } from '@/store/slices/forgotPassword';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { adminLoginEmail } = useSelector((state: RootState) => state.auth);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: adminLoginEmail || '' },
  });

  const emailValue = form.watch('email');

  useEffect(() => {
    if (emailValue !== adminLoginEmail) {
      dispatch(setAdminLoginEmail(emailValue));
    }
  }, [emailValue, dispatch, adminLoginEmail]);

  const {
    isPending,
    mutate: forgotPasswordMutate,
    error,
  } = useMutation({
    mutationFn: async (data: ForgotPasswordInput) => adminForgotPassword(data),
    onSuccess: (data) => {
      dispatch(setEmail(emailValue));
      toast.success(data?.message ?? 'Password reset otp sent to your email.');
      router.push('/admin/otp-verify');
    },
    onError: () => {
      // toast.error(
      //   ((error as AxiosError)?.response?.data as any)?.errorMessage ||
      //     'Failed to send reset link. Please try again later.'
      // );
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPasswordMutate(data);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] px-[10px] md:px-[30px] pt-[120px] md:pt-[180px] pb-[80px] md:pb-[120px]">
      <div className="w-full max-w-md border rounded-2xl shadow-md p-6 px-[20px]  md:px-[30px] bg-card">
        <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
        <p className="text-sm text-center text-muted-foreground mb-6">
          Enter your email address and we’ll send you a reset link.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {((error as AxiosError)?.response?.data as any)?.errorMessage && (
              <div className="text-red-500 text-sm mb-1">
                {((error as AxiosError)?.response?.data as any)?.errorMessage}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gold h-[40px] md:h-[45px] text-[16px] md:text-[18px]"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </form>
        </Form>

        {/* Back to Login */}
        <div className="text-center mt-4">
          <Link href="/admin/login" className="text-sm text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
