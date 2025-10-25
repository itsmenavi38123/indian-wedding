import { TeamMemberLoginInput } from '@/app/team-member/(auth)/login/page';
import { AxiosError } from 'axios';
import axiosInstance from '../axiosInstance';
import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { ForgotPasswordInput } from '@/app/team-member/(auth)/forgot-password/page';
import { VerifyOtpInput } from '@/app/team-member/(auth)/otp-verify/page';
import { ResetPasswordInput } from '@/app/team-member/(auth)/reset-password/page';

export const teamMemberLogin = async (payload: TeamMemberLoginInput) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.teamMemberAuth.teamMemberLogin, payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error creating lead:', error);
    toast.error(error.response?.data?.errorMessage || 'Failed to Login.');
    throw error;
  }
};

const getCurrentTeamMember = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URLS.teamMemberAuth.currentTeamMember}`);

    return data;
  } catch (error: AxiosError | any) {
    throw error;
  }
};

export function useGetCurrentTeamMember(enabled: boolean = true) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.auth.currentlyTeamMember],
    queryFn: getCurrentTeamMember,
    retry: false,
    staleTime: 1000 * 60,
    enabled: enabled,
  });
}

export const teamMemberLogout = async () => {
  try {
    const { data } = await axiosInstance.post(API_URLS.teamMemberAuth.teamMemberLogout);
    return data;
  } catch (error: any) {
    console.error('Error:', error);
    toast.error(error.response?.data?.message || 'Failed to logout.');
    throw error;
  }
};

export const teamMemberForgotPassword = async (payload: ForgotPasswordInput) => {
  try {
    const { data } = await axiosInstance.post(
      API_URLS.teamMemberAuth.teamMemberForgotPassword,
      payload
    );
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error forgot password:', error);
    throw error;
  }
};

export const teamMemberVerifyOtp = async (payload: VerifyOtpInput) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.teamMemberAuth.teamMemberVerifyOtp, payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error verify otp:', error);
    throw error;
  }
};

const teamMemberGetLastOtpTime = async (email: string) => {
  try {
    const { data } = await axiosInstance.get(
      `${API_URLS.teamMemberAuth.teamMemberLastTimeOptSent}?email=${email}`
    );
    return data;
  } catch (error: AxiosError | any) {
    throw error;
  }
};

export function useTeamMemberGetLastOtpTime(email: string | null) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.auth.adminForgotPassword, email],
    queryFn: () => teamMemberGetLastOtpTime(email as string),
    retry: false,
    staleTime: 0,
    enabled: !!email,
  });
}

export const teamMemberResetPassword = async (payload: ResetPasswordInput) => {
  try {
    const newPayload = {
      tokenId: payload.otpToken,
      newPassword: payload.newPassword,
    };

    const { data } = await axiosInstance.post(
      API_URLS.teamMemberAuth.teamMemberResetPassword,
      newPayload
    );
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
