'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '../context/userContext';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { userSignup } from '@/services/api/userAuth';
import { signUpSchema, UserSignUpInput } from '../schema';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { countryCodes } from '@/utils/data';

const UserSignUpPage = () => {
  const { setEmail, setUserName } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<UserSignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      countryCode: '+91',
    },
  });

  const {
    reset,
    formState: { errors },
  } = form;

  const onSubmit = async (data: UserSignUpInput) => {
    setLoading(true);
    try {
      const trimmedData: UserSignUpInput = {
        ...data,
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password.trim(),
        phone: data.phone,
      };

      const resp = await userSignup(trimmedData);

      if (resp?.success) {
        setEmail(resp.email);
        setUserName(resp.name);
        toast.success('Signup successful');
        reset();
        router.push('/user/login');
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] px-[10px] md:px-[30px] pt-[120px] md:pt-[180px] pb-[80px] md:pb-[120px]">
      <div className="w-full max-w-md border rounded-2xl shadow-md p-6 bg-card">
        <h1 className="text-2xl font-bold text-center mb-6">User Signup</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
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

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.clearErrors('password');
                        }}
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

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        placeholder="Confirm your password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
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

            {/* Contact Info */}
            <FormItem>
              <FormLabel>Contact Info</FormLabel>
              <div className="flex gap-2">
                {/* Country Code */}
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-base outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value=""></option>
                          {countryCodes.map(({ code, name }) => (
                            <option key={code} value={code}>
                              {code} ({name})
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input type="tel" placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormItem>

            <Button
              type="submit"
              className="w-full bg-gold h-[40px] md:h-[45px] text-[16px] md:text-[18px]"
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Signup'}
            </Button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/user/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default UserSignUpPage;
