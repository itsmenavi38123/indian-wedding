'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z, ZodTypeAny } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';

// Base fields every login form will have
type BaseLoginValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

// Props for the reusable form
type LoginFormProps<TSchema extends ZodTypeAny> = {
  schema: TSchema;
  defaultValues?: Partial<BaseLoginValues>;
  onSubmit: (data: z.infer<TSchema> & BaseLoginValues) => void;
  heading: string;
  isPending: boolean;
  error: any;
  forgotPasswordPath: string;
  signUpPath?: string; // ✅ dynamic signup link
};

export function LoginForm<TSchema extends ZodTypeAny>({
  schema,
  defaultValues = {},
  onSubmit,
  heading,
  isPending,
  error,
  forgotPasswordPath,
  signUpPath,
}: LoginFormProps<TSchema>) {
  const [showPassword, setShowPassword] = useState(false);

  // Merge Zod schema type + base login fields
  type FormValues = z.infer<TSchema> & BaseLoginValues;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      email: defaultValues.email ?? '',
      password: defaultValues.password ?? '',
      rememberMe: defaultValues.rememberMe ?? false,
    } as any,
  });

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] px-[10px] md:px-[30px] pt-[120px] md:pt-[180px] pb-[80px] md:pb-[120px]">
      <div className="w-full max-w-md border rounded-2xl shadow-md p-6 px-[20px]  md:px-[30px] bg-card">
        <h1 className="text-2xl font-bold text-center mb-6">{heading}</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <FormField
              control={form.control}
              name={'email' as any}
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

            {/* Password with Forgot Password on the right */}
            <FormField
              control={form.control}
              name={'password' as any}
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href={forgotPasswordPath}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remember Me */}
            <FormField
              control={form.control}
              name={'rememberMe' as any}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal text-sm">Remember Me</FormLabel>
                </FormItem>
              )}
            />

            {/* Error Message */}
            {((error as AxiosError)?.response?.data as any)?.errorMessage && (
              <div className="text-red-500 text-sm mb-1">
                {((error as AxiosError)?.response?.data as any)?.errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gold h-[40px] md:h-[45px] text-[16px] md:text-[18px]"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </Form>

        {signUpPath && (
          <>
            {/* Sign Up Link (dynamic) */}
            <div className="text-center mt-4 text-[14px] text-black">
              Create an account?{' '}
              <Link href={signUpPath} className="text-gold hover:underline ">
                Sign up
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
