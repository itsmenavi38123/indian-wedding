import { User } from '@/types/user/User';
import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import { UserLoginInput } from '@/app/user/(auth)/schema';
import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';

export const userSignup = async (formData: User) => {
  try {
    const resp = await axiosInstance.post(API_URLS.userAuth.userSignup, formData);
    return resp.data;
  } catch (error: any) {
    console.error('Error:', error);
    const errorMessage = error.response?.data?.errorMessage || 'Failed to Login.';
    toast.error(errorMessage);
    return errorMessage;
  }
};

export const userLogin = async (formData: UserLoginInput) => {
  try {
    const resp = await axiosInstance.post(API_URLS.userAuth.userLogin, formData);
    return resp.data;
  } catch (error: any) {
    console.error('Error:', error);
    const errorMessage = error.response?.data?.errorMessage || 'Failed to Login.';
    toast.error(errorMessage);
    return errorMessage;
  }
};

const getCurrentUser = async () => {
  try {
    const { data } = await axiosInstance.get(`${API_URLS.userAuth.currentUser}`);
    return data;
  } catch (error: AxiosError | any) {
    throw error;
  }
};

export function useGetCurrentUser(enabled: boolean = true) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.user.currentUser],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60,
    enabled: enabled,
  });
}

export const userLogout = async () => {
  try {
    const { data } = await axiosInstance.post(API_URLS.userAuth.userLogout);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error:', error);
    toast.error(error.response?.data?.message || 'Failed to logout.');
    throw error;
  }
};
