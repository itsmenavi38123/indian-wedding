import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import axiosInstance from '../axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

const getEvent = async ({ queryKey }: { queryKey: any }) => {
  const [, { page, limit, sortBy, sortOrder, status, search }] = queryKey;
  try {
    const { data } = await axiosInstance.get(API_URLS.vendor.event, {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        search,
      },
    });
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error fetching leads:', error.response?.data);
      toast.error(error?.message || 'Failed to fetch leads. Please try again later.');
    } else {
      console.error('Unknown error:', error);
      toast.error('Failed to fetch leads. Please try again later.');
    }
    throw error;
  }
};

export function useGetEvents({
  page = 1,
  limit = 25,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  status = 'ALL',
  search = '',
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  search?: string;
  archived?: boolean;
}) {
  return useQuery({
    queryKey: [
      API_QUERY_KEYS.event.getAllEvents,
      { page, limit, sortBy, sortOrder, status, search },
    ],
    queryFn: getEvent,
  });
}
