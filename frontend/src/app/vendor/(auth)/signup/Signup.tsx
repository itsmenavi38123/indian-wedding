'use client';

import { useForm } from 'react-hook-form';
import * as Slider from '@radix-ui/react-slider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '../context/userContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { SERVICE_TYPE_VALUES, ServiceType } from '@/types/lead/Lead';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { VendorApiPayload, VendorInput, vendorSchema } from '../schema';
import { VendorSignup } from '@/services/api/vendorAuth';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { countryCodes } from '@/utils/data';

export const Signup = () => {
  const { setEmail, setUserName } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<VendorInput>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      countryCode: '+91',
      serviceTypes: [],
      minimumAmount: 500000,
      maximumAmount: 20000000,
    },
  });

  const onSubmit = async (data: VendorInput) => {
    setLoading(true);
    try {
      const trimmedData: VendorApiPayload = {
        ...data,
        serviceTypes: data.serviceTypes.join(','),
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password.trim(),
        contactNo: data.contactNo.trim(),
        countryCode: data.countryCode.trim(),
      };

      const resp = await VendorSignup(trimmedData);
      if (resp?.success) {
        setEmail(resp.email);
        setUserName(resp.name);
        toast.success('Signup successful');
        form.reset();
        router.push('/vendor/login');
      }
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const minBudget = form.watch('minimumAmount') ?? 500000;
  const maxBudget = form.watch('maximumAmount') ?? 20000000;

  const setBudget = (newMin: number, newMax: number) => {
    form.setValue('minimumAmount', newMin);
    form.setValue('maximumAmount', newMax);
    form.clearErrors(['minimumAmount', 'maximumAmount']);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f5] px-[10px] md:px-[30px] pt-[120px] md:pt-[180px] pb-[80px] md:pb-[120px]">
      <div className="w-full max-w-md border rounded-2xl shadow-md p-6 bg-card">
        <h1 className="text-2xl font-bold text-center mb-6">Vendor Signup</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            onFocus={() => form.clearErrors()}
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors('name');
                      }}
                    />
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
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors('email');
                      }}
                    />
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

            {/* Service Types */}
            <FormField
              control={form.control}
              name="serviceTypes"
              render={({ field }) => {
                const options = SERVICE_TYPE_VALUES.map((type) => ({
                  label: type,
                  value: type,
                }));
                return (
                  <FormItem>
                    <FormLabel>Service Types</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={options}
                        value={field.value || []}
                        onChange={(newVal) =>
                          form.setValue('serviceTypes', newVal as ServiceType[])
                        }
                        dropdownClassName="max-h-100 overflow-auto hide-scrollbar"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Budget Slider */}
            <FormItem>
              <FormLabel>Budget Range</FormLabel>
              <FormControl>
                <div>
                  {/* Slider */}
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    min={500000}
                    max={20000000}
                    step={1000}
                    value={[minBudget, maxBudget]}
                    onValueChange={([newMin, newMax]) => setBudget(newMin, newMax)}
                  >
                    <Slider.Track className="bg-gray-200 relative flex-1 h-1 rounded-full">
                      <Slider.Range className="absolute bg-blue-500 h-full rounded-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-5 h-5  rounded-full shadow-md cursor-pointer" />
                    <Slider.Thumb className="block w-5 h-5  runded-full shadow-md cursor-pointer" />
                  </Slider.Root>

                  {/* Quick select buttons */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      [500000, 1000000],
                      [1000000, 2500000],
                      [2500000, 5000000],
                      [5000000, 20000000],
                    ].map(([quickMin, quickMax], idx) => {
                      const isSelected = minBudget === quickMin && maxBudget === quickMax;

                      return (
                        <Button
                          key={idx}
                          type="button"
                          onClick={() => setBudget(quickMin, quickMax)}
                          className={`cursor-pointer ${
                            isSelected
                              ? 'borderbg-black text-white'
                              : 'border bg-white text-black hover:text-white hover:bg-black'
                          }`}
                        >
                          ₹{quickMin / 100000}L - ₹{quickMax / 100000}L+
                        </Button>
                      );
                    })}
                  </div>

                  {/* Manual input fields */}
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min={500000}
                      max={maxBudget}
                      value={minBudget}
                      onChange={(e) => setBudget(Number(e.target.value) || 500000, maxBudget)}
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      min={minBudget}
                      max={20000000}
                      value={maxBudget}
                      onChange={(e) => setBudget(minBudget, Number(e.target.value) || 20000000)}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>

            {/* Contact Info */}
            <FormItem>
              <FormLabel>Contact Info</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
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
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNo"
                  render={({ field }) => (
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Phone number"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.clearErrors('contactNo');
                        }}
                      />
                    </FormControl>
                  )}
                />
              </div>
              <FormMessage>
                {form.formState.errors.countryCode?.message ||
                  form.formState.errors.contactNo?.message}
              </FormMessage>
            </FormItem>

            {/* Submit */}
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
            <a href="/vendor/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </div>
        </Form>
      </div>
    </div>
  );
};
