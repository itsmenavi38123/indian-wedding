import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

// ----------------------
// 🧱 Types
// ----------------------

export interface Media {
  id: string;
  vendorServiceId: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface VendorService {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  locationId: string | null;
  country: string;
  state: string;
  city: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  thumbnailId: string;
  media: Media[];
  thumbnail: Media | null;
}
export interface CreateVendorServicePayload {
  vendorId: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  country: string;
  state: string;
  city: string;
  thumbnail?: File; // single image
  media?: File[]; // multiple images
}

const getVendorServices = async ({ queryKey }: { queryKey: any }) => {
  const [, { vendorId, page, limit, search, category }] = queryKey;

  if (!vendorId) {
    toast.error('Vendor ID is required to fetch services.');
    throw new Error('Vendor ID is required');
  }

  try {
    const { data } = await axiosInstance.get(API_URLS.vendorService.getAllByVendor, {
      params: { page, limit, search, category },
    });
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error fetching vendor services:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch vendor services.');
    } else {
      console.error('Unknown error:', error);
      toast.error('Failed to fetch vendor services. Please try again later.');
    }
    throw error;
  }
};

// ✅ CREATE Vendor Service
export const createVendorService = async (formData: FormData) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.vendorService.create, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    toast.success('Service created successfully!');
    return data;
  } catch (error: any) {
    console.error('Error creating vendor service:', error);
    toast.error(error.response?.data?.message || 'Failed to create vendor service.');
    throw error;
  }
};

export const updateVendorService = async (id: string, formData: FormData) => {
  if (!id) throw new Error('Service ID is required for update');

  try {
    const { data } = await axiosInstance.put(
      API_URLS.vendorService.updateById(id).replace(`:${id}`, id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    toast.success('Service updated successfully!');
    return data;
  } catch (error: any) {
    console.error('Error updating vendor service:', error);
    toast.error(error.response?.data?.message || 'Failed to update vendor service.');
    throw error;
  }
};

// ✅ Get Vendor Service By ID
export const getVendorServiceById = async (id: string) => {
  console.log('id+++++', id);
  if (!id) throw new Error('Service ID is required');

  try {
    const { data } = await axiosInstance.get(API_URLS.vendorService.getById(id));
    console.log('Fetched vendor service by ID:', data);
    return data;
  } catch (error: any) {
    console.error('Error fetching vendor service by ID:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch vendor service.');
    throw error;
  }
};

// ✅ Hook: useGetVendorServiceById (React Query)
export function useGetVendorServiceById(serviceId?: string): UseQueryResult<any, Error> {
  console.log('serviceId+++++', serviceId);
  return useQuery({
    queryKey: [API_QUERY_KEYS.vendorService.getById],
    queryFn: () => getVendorServiceById(serviceId!),
    enabled: !!serviceId,
  });
}

// ✅ Hook: Get vendor services (React Query)
export function useGetVendorServices({
  vendorId,
  page = 1,
  limit = 25,
  search = '',
  category = '',
}: {
  vendorId?: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: [
      API_QUERY_KEYS.vendorService.getAllByVendor,
      { vendorId, page, limit, search, category },
    ],
    queryFn: getVendorServices,
    enabled: !!vendorId,
  });
}

// ✅ DELETE Vendor Service
export const deleteVendorService = async (id: string) => {
  if (!id) throw new Error('Service ID is required for deletion');

  try {
    const { data } = await axiosInstance.delete(API_URLS.vendorService.deleteById(id));
    toast.success('Service deleted successfully!');
    return data;
  } catch (error: any) {
    console.error('Error deleting vendor service:', error);
    toast.error(error.response?.data?.message || 'Failed to delete vendor service.');
    throw error;
  }
};

// ✅ Hook: useDeleteVendorService (React Query)
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteVendorService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVendorService(id),
    onSuccess: (_, id) => {
      // Invalidate queries to refresh the vendor services list
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEYS.vendorService.getAllByVendor],
      });

      console.log(`Deleted vendor service with ID: ${id}`);
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
    },
  });
}
