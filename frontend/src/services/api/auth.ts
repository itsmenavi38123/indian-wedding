import axiosInstance from '../axiosInstance';
import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import { AdminLoginInput } from '@/app/admin/(auth)/login/page';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { ForgotPasswordInput } from '@/app/admin/(auth)/forgot-password/page';
import { VerifyOtpInput } from '@/app/admin/(auth)/otp-verify/page';
import { ResetPasswordInput } from '@/app/admin/(auth)/reset-password/page';

export const adminLogin = async (payload: AdminLoginInput) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.auth.adminLogin, payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error creating lead:', error);
    toast.error(error.response?.data?.errorMessage || 'Failed to Login.');
    throw error;
  }
};

const getCurrentAdmin = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URLS.auth.currentAdmin}`);

    return data;
  } catch (error: AxiosError | any) {
    throw error;
  }
};

export function useGetCurrentAdmin(enabled: boolean = true) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.auth.currentAdmin],
    queryFn: getCurrentAdmin,
    retry: false,
    staleTime: 1000 * 60,
    enabled: enabled,
  });
}

export const adminLogout = async () => {
  try {
    const { data } = await axiosInstance.post(API_URLS.auth.adminLogout);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error creating lead:', error);
    toast.error(error.response?.data?.message || 'Failed to create lead.');
    throw error;
  }
};

export const adminForgotPassword = async (payload: ForgotPasswordInput) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.auth.adminForgotPassword, payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error forgot password:', error);
    throw error;
  }
};

export const adminVerifyOtp = async (payload: VerifyOtpInput) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.auth.verifyOtp, payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error verify otp:', error);
    throw error;
  }
};

const adminGetLastOtpTime = async (email: string) => {
  try {
    const { data } = await axiosInstance.get(`${API_URLS.auth.lastTimeOptSent}?email=${email}`);
    return data;
  } catch (error: AxiosError | any) {
    throw error;
  }
};

export function useAdminGetLastOtpTime(email: string | null) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.auth.adminForgotPassword, email],
    queryFn: () => adminGetLastOtpTime(email as string),
    retry: false,
    staleTime: 0,
    enabled: !!email,
  });
}

export const adminResetPassword = async (payload: ResetPasswordInput) => {
  try {
    const newPayload = {
      tokenId: payload.otpToken,
      newPassword: payload.newPassword,
    };

    const { data } = await axiosInstance.post(API_URLS.auth.resetPassword, newPayload);
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
