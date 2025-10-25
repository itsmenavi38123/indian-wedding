'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { teamMemberResetPassword } from '@/services/api/teamMemberAuth';

// ✅ Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters long')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[0-9]/, 'At least one number')
  .regex(/[^A-Za-z0-9]/, 'At least one special character');

const resetPasswordSchema = z
  .object({
    otpToken: z.string().optional(),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const router = useRouter();
  const { otpToken } = useSelector((state: RootState) => state.forgotPassword);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '', otpToken: otpToken as string },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const {
    isPending,
    mutate: resetPasswordMutate,
    error,
  } = useMutation({
    mutationFn: async (data: ResetPasswordInput) => teamMemberResetPassword(data),
    onSuccess: (data) => {
      console.log('resetPassword: ', data);

      toast.success(data?.message ?? 'Password reset successfully.');
      router.push('/team-member/login');
    },
    onError: (error) => {
      toast.error(
        ((error as AxiosError)?.response?.data as any)?.errorMessage ||
          'Failed to reset password. Please try again later.'
      );
    },
  });

  const calculateStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return { label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { label: 'Fair', color: 'bg-orange-500' };
      case 3:
        return { label: 'Good', color: 'bg-yellow-500' };
      case 4:
        return { label: 'Strong', color: 'bg-green-500' };
      case 5:
        return { label: 'Very Strong', color: 'bg-emerald-600' };
      default:
        return { label: 'Weak', color: 'bg-gray-400' };
    }
  };

  const onSubmit = (data: ResetPasswordInput) => {
    resetPasswordMutate(data);
  };

  useEffect(() => {
    if (!otpToken) {
      router.push('/team-member/forgot-password');
    }
  }, [otpToken, router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] px-[10px] md:px-[30px] pt-[120px] md:pt-[180px] pb-[80px] md:pb-[120px]">
      <div className="w-full max-w-md border rounded-2xl shadow-md p-6 bg-card">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setPasswordStrength(calculateStrength(e.target.value));
                        }}
                        onPaste={(e) => e.preventDefault()}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  {/* Strength Bar */}
                  {field.value && (
                    <div className="mt-2">
                      <div className="w-full h-2 bg-gray-200 rounded">
                        <div
                          className={`h-2 rounded transition-all duration-300 ${
                            getStrengthLabel(passwordStrength).color
                          }`}
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className={`text-sm mt-1`}>
                        Strength: {getStrengthLabel(passwordStrength).label}
                      </p>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Re-enter new password"
                      {...field}
                      onPaste={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                    />
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

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </form>
        </Form>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full bg-gold h-[40px] md:h-[45px] text-[16px] md:text-[18px]"
            onClick={() => router.push('/team-member/login')}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
