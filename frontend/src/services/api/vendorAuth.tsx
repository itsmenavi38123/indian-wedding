import { Vendor } from '@/types/user/User';
import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import { VendorLoginInput } from '@/app/vendor/(auth)/schema';
import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';

export const VendorSignup = async (formData: Vendor) => {
  try {
    const resp = await axiosInstance.post(API_URLS.vendorAuth.signup, formData);
    return resp.data;
  } catch (error: any) {
    console.error('Error:', error);
    const errorMessage = error.response?.data?.errorMessage || 'Failed to Login.';
    toast.error(errorMessage);
    return errorMessage;
  }
};

export const vendorLogin = async (formData: VendorLoginInput) => {
  try {
    const resp = await axiosInstance.post(API_URLS.vendorAuth.vendorLogin, formData);
    return resp.data;
  } catch (error: any) {
    console.error('Error:', error);
    const errorMessage = error.response?.data?.errorMessage || 'Failed to Login.';
    toast.error(errorMessage);
    return errorMessage;
  }
};

const getCurrentVendor = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URLS.vendorAuth.currentVendor}`);
    return data;
  } catch (error: AxiosError | any) {
    throw error;
  }
};

export function useGetCurrentVendor(enabled: boolean = true) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.vendor.currentVendor],
    queryFn: getCurrentVendor,
    retry: false,
    staleTime: 1000 * 60,
    enabled: enabled,
  });
}

export const vendorLogout = async () => {
  try {
    const { data } = await axiosInstance.post(API_URLS.vendorAuth.vendorLogout);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error creating lead:', error);
    toast.error(error.response?.data?.message || 'Failed to create lead.');
    throw error;
  }
};

export const vendorForgotPassword = async (payload: any) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.vendorAuth.vendorForgotPassword, payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error forgot password:', error);
    throw error;
  }
};

export const vendorVerifyOtp = async (payload: any) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.vendorAuth.verifyOtp, payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error verify otp:', error);
    throw error;
  }
};

const vendorGetLastOtpTime = async (email: string) => {
  try {
    const { data } = await axiosInstance.get(
      `${API_URLS.vendorAuth.lastTimeOptSent}?email=${email}`
    );
    return data;
  } catch (error: AxiosError | any) {
    throw error;
  }
};

export function useVendorGetLastOtpTime(email: string | null) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.vendor.vendorForgotPassword, email],
    queryFn: () => vendorGetLastOtpTime(email as string),
    retry: false,
    staleTime: 0,
    enabled: !!email,
  });
}

export const vendorResetPassword = async (payload: any) => {
  try {
    const newPayload = {
      tokenId: payload.otpToken,
      newPassword: payload.newPassword,
    };

    const { data } = await axiosInstance.post(API_URLS.vendorAuth.resetPassword, newPayload);
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error verify otp:', error);
      toast.error(error.response?.data?.message || 'Failed to create lead.');
    } else {
      console.error('Error verify otp', error);
      toast.error('Failed to create lead.');
    }
    throw error;
  }
};
