import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import { API_URLS, API_QUERY_KEYS } from '../apiBaseUrl';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export interface Notification {
  id: string;
  message: string;
  type: string;
  recipientId: string | null;
  recipientRole: string | null;
  isRead: boolean;
  createdAt: string;
}

const getNotifications = async (): Promise<Notification[]> => {
  try {
    const { data } = await axiosInstance.get(API_URLS.notifications.getAll);
    return data.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || 'Failed to fetch notifications.');
    } else {
      toast.error('Failed to fetch notifications. Please try again later.');
    }
    throw error;
  }
};

export function useNotifications(): UseQueryResult<Notification[], Error> {
  return useQuery({
    queryKey: [API_QUERY_KEYS.notifications?.getAll || 'notifications'],
    queryFn: getNotifications,
    refetchInterval: 10000,
  });
}

export const markNotificationAsRead = async (id: string) => {
  try {
    const { data } = await axiosInstance.put(API_URLS.notifications.markAsRead(id));
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || 'Failed to mark as read.');
    } else {
      toast.error('Failed to mark as read.');
    }
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const { data } = await axiosInstance.put(API_URLS.notifications.markAllAsRead);
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || 'Failed to mark all as read.');
    } else {
      toast.error('Failed to mark all as read.');
    }
    throw error;
  }
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, id: string) => {
      queryClient.setQueryData<Notification[]>(
        [API_QUERY_KEYS.notifications?.getAll || 'notifications'],
        (old) => old?.filter((notif) => notif.id !== id) || []
      );
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(
        [API_QUERY_KEYS.notifications?.getAll || 'notifications'],
        []
      );
    },
  });
};
