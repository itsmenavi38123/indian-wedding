import { useQuery } from '@tanstack/react-query';
import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

/* -------------------- GET VENDORS -------------------- */
const getVendors = async ({ queryKey }: { queryKey: any }) => {
  const [, { page, limit, sortBy, sortOrder, search, status }] = queryKey;

  try {
    const { data } = await axiosInstance.get(API_URLS.vendor.getVendors, {
      params: { page, limit, sortBy, sortOrder, search, status },
    });
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error fetching vendors:', error.response?.data);
      toast.error(error?.message || 'Failed to fetch vendors. Please try again later.');
    } else {
      console.error('Unknown error:', error);
      toast.error('Failed to fetch vendors. Please try again later.');
    }
    throw error;
  }
};

export function useGetVendors({
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
}) {
  return useQuery({
    queryKey: [
      API_QUERY_KEYS.vendor.getVendors,
      { page, limit, sortBy, sortOrder, search, status },
    ],
    queryFn: getVendors,
  });
}

/* -------------------- GET VENDOR BY ID -------------------- */
const getVendorById = async ({ queryKey }: { queryKey: any }) => {
  const [, vendorId] = queryKey;

  if (!vendorId) {
    toast.error('Vendor ID is required to fetch vendor details.');
    throw new Error('Vendor ID is required');
  }

  try {
    const { data } = await axiosInstance.get(API_URLS.vendor.getSingleVendor(vendorId));
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error fetching vendor:', error);
    toast.error(error.message || 'Failed to fetch vendor. Please try again later.');
    throw error;
  }
};

export function useGetVendor(vendorId?: string) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.vendor.getSingleVendor, vendorId],
    queryFn: getVendorById,
    enabled: !!vendorId,
  });
}

/* -------------------- CREATE / UPDATE VENDOR -------------------- */
export interface CreateVendorPayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  serviceTypes?: string;
  address?: string;
  website?: string;
  notes?: string;
  leadId?: string; // if tied to lead
  status?: string;
}

export const createVendor = async (payload: FormData | Record<string, any>) => {
  try {
    const isFormData = payload instanceof FormData;
    const { data } = await axiosInstance.post(
      API_URLS.vendor.create,
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error creating vendor:', error?.response);
    toast.error(error.response?.data?.errorMessage || 'Failed to create vendor.');
    throw error;
  }
};

export const updateVendor = async (vendorId: string, payload: FormData | Record<string, any>) => {
  try {
    const isFormData = payload instanceof FormData;
    const { data } = await axiosInstance.put(
      API_URLS.vendor.updateVendorById(vendorId),
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating vendor:', error);
    toast.error(error.response?.data?.message || 'Failed to update vendor.');
    throw error;
  }
};

/* -------------------- STATUS UPDATE (Single / Bulk) -------------------- */
export const updateVendorStatus = async (vendorId: string, status: string) => {
  if (!vendorId) {
    toast.error('Vendor ID is required to update status.');
    throw new Error('Vendor ID is required');
  }
  try {
    const { data } = await axiosInstance.post(API_URLS.vendor.updateVendorStatus(vendorId), {
      status,
    });
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating vendor status:', error);
    toast.error(error.response?.data?.message || 'Failed to update vendor status.');
    throw error;
  }
};

export const updateBulkVendorStatus = async (ids: string[], status: string) => {
  try {
    const { data } = await axiosInstance.put(API_URLS.vendor.bulkUpdateVendorStatus, {
      ids,
      status,
    });
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error bulk updating vendor status:', error);
    toast.error(error.response?.data?.message || 'Failed to update vendor status.');
    throw error;
  }
};

/* -------------------- EXPORT -------------------- */
export const exportVendorsWithIds = async ({ ids }: { ids: string[] }): Promise<any> => {
  return axiosInstance.post(
    API_URLS.vendor.exportVendorsWithIdsCsv,
    { ids },
    {
      responseType: 'blob',
    }
  );
};
