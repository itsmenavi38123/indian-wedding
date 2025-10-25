'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { setOtpToken } from '@/store/slices/forgotPassword';
import {
  teamMemberForgotPassword,
  teamMemberVerifyOtp,
  useTeamMemberGetLastOtpTime,
} from '@/services/api/teamMemberAuth';

const verifyOtpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  otp: z
    .string()
    .length(6, { message: 'OTP must be exactly 6 digits' })
    .regex(/^\d{6}$/, { message: 'OTP must contain only numbers' }),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

const VerifyOtpPage = () => {
  const router = useRouter();
  const { email } = useSelector((state: RootState) => state.forgotPassword);
  const dispatch = useDispatch();

  const [remainingTime, setRemainingTime] = useState(0);

  const { data: lastOtpData } = useTeamMemberGetLastOtpTime(email);

  useEffect(() => {
    if (lastOtpData?.data?.sendTime) {
      const lastSent = new Date(lastOtpData?.data?.sendTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, 60 - Math.floor((now - lastSent) / 1000));

      setRemainingTime(diff);
    }
  }, [lastOtpData]);

  useEffect(() => {
    if (remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);

  useEffect(() => {
    if (!email) {
      router.push('/team-member/forgot-password');
    }
  }, [email, router]);

  const form = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: email || '',
      otp: '',
    },
  });

  const {
    isPending,
    mutate: verifyOtpMutate,
    error,
  } = useMutation({
    mutationFn: async (data: VerifyOtpInput) => teamMemberVerifyOtp(data),
    onSuccess: (data) => {
      dispatch(setOtpToken(data?.data?.tokenId));
      toast.success(data?.message ?? 'OTP verified successfully.');
      router.push('/team-member/reset-password');
    },
    onError: (error) => {
      toast.error(
        ((error as AxiosError)?.response?.data as any)?.errorMessage ||
          'Invalid or expired OTP. Please try again.'
      );
    },
  });

  // 🔹 Resend OTP mutation
  const { mutate: resendOtpMutate, isPending: resendPending } = useMutation({
    mutationFn: async () => teamMemberForgotPassword({ email: email as string }),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'OTP resent successfully.');
      setRemainingTime(60);
    },
    onError: (error) => {
      toast.error(
        ((error as AxiosError)?.response?.data as any)?.errorMessage ||
          'Failed to resend OTP. Please try again.'
      );
    },
  });

  const onSubmit = (data: VerifyOtpInput) => {
    verifyOtpMutate(data);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] px-[10px] md:px-[30px] pt-[120px] md:pt-[180px] pb-[80px] md:pb-[120px]">
      <div className="w-full max-w-md border rounded-2xl shadow-md p-6 bg-card">
        <h1 className="text-2xl font-bold text-center mb-6">Verify OTP</h1>
        <p className="text-sm text-center text-muted-foreground mb-6">
          Enter the 6-digit code sent to your email.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="w-full justify-center">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        className=""
                      >
                        <InputOTPGroup className="mx-auto gap-1">
                          <InputOTPSlot
                            index={0}
                            className="h-10 w-10 text-xl text-center border rounded-md"
                          />
                          <InputOTPSlot
                            index={1}
                            className="h-10 w-10 text-xl text-center border rounded-md"
                          />
                          <InputOTPSlot
                            index={2}
                            className="h-10 w-10 text-xl text-center border rounded-md"
                          />
                          <InputOTPSlot
                            index={3}
                            className="h-10 w-10 text-xl text-center border rounded-md"
                          />
                          <InputOTPSlot
                            index={4}
                            className="h-10 w-10 text-xl text-center border rounded-md"
                          />
                          <InputOTPSlot
                            index={5}
                            className="h-10 w-10 text-xl text-center border rounded-md"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {((error as AxiosError)?.response?.data as any)?.errorMessage && (
              <div className="text-red-500 text-sm mb-1">
                {((error as AxiosError)?.response?.data as any)?.errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify OTP
            </Button>
          </form>
        </Form>

        <div className="flex flex-col gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            className={`w-full ${remainingTime > 0 ? 'cursor-not-allowed' : ''}`}
            disabled={remainingTime > 0 || resendPending}
            onClick={() => resendOtpMutate()}
          >
            {resendPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {remainingTime > 0 ? `Resend OTP in ${remainingTime}s` : 'Resend OTP'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full bg-gold h-[40px] md:h-[45px] text-[16px] md:text-[18px]"
            onClick={() => router.push('/team-member/forgot-password')}
          >
            Back to Forgot Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
