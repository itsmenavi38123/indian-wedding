import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface VendorHomePageResponse {
  pagination: Pagination;
  data: any[];
}

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

interface QueryParams {
  page: number;
  limit: number | 'all';
  search: string;
}

export const getVendorTeams = async ({ queryKey }: { queryKey: any }) => {
  // Ensure queryKey has a second element
  const [, params = { page: 1, limit: 10, search: '' }] = queryKey;
  const { page, limit, search } = params as QueryParams;

  try {
    console.log('[getVendorTeams] Calling API...', params);

    const response = await axiosInstance.get(API_URLS.vendor.getTeams, {
      params: { page, limit, search },
    });

    console.log('[getVendorTeams] Response:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('[getVendorTeams] API error:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch teams.');
    } else {
      toast.error('Failed to fetch teams.');
    }
    throw error;
  }
};

interface VendorTeamsParams {
  page?: number;
  limit?: number | 'all';
  search?: string;
}

export const useGetVendorTeams = ({
  page = 1,
  limit = 10,
  search = '',
}: VendorTeamsParams = {}) => {
  return useQuery({
    queryKey: ['vendorTeams', { page, limit, search }],
    queryFn: getVendorTeams,
  });
};

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

const getVendorTeamById = async ({ queryKey }: { queryKey: any }) => {
  const [, teamId] = queryKey;

  if (!teamId) {
    toast.error('Team ID is required to fetch team details.');
    throw new Error('Team ID is required');
  }

  const url = API_URLS.vendor.getSingleTeam(teamId);
  console.log('[getVendorTeamById] Request URL:', url);
  try {
    const { data } = await axiosInstance.get(url);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error fetching vendor team:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch team.');
    throw error;
  }
};

export function useGetVendorTeamById(teamId?: string) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.vendor.getSingleTeam, teamId],
    queryFn: getVendorTeamById,
    enabled: !!teamId,
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

export const createVendorTeams = async (payload: FormData | Record<string, any>) => {
  try {
    const isFormData = payload instanceof FormData;
    const { data } = await axiosInstance.post(
      API_URLS.vendor.createTeams,
      payload,
      isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error creating vendor teams:', error?.response);
    toast.error(error.response?.data?.errorMessage || 'Failed to create teams.');
    throw error;
  }
};

export function useCreateVendorTeams() {
  return useMutation({
    mutationFn: createVendorTeams,
    onSuccess: (data) => {
      toast.success('Teams created successfully!');
      console.log('Teams created successfully:', data);
    },
    onError: (error: any) => {
      console.error('Failed to create teams:', error?.response?.data || error.message);
      toast.error(error?.response?.data?.errorMessage || 'Failed to create teams.');
    },
  });
}

export const deleteVendorTeam = async (teamId: string) => {
  if (!teamId) throw new Error('Team ID is required for deletion');

  try {
    const { data } = await axiosInstance.delete(API_URLS.vendor.deleteById(teamId));
    return data;
  } catch (error: any) {
    console.error('Error deleting vendor team:', error);
    toast.error(error.response?.data?.message || 'Failed to delete vendor team.');
    throw error;
  }
};

export function useDeleteVendorTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => deleteVendorTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEYS.vendor.getTeams],
      });
      toast.success(`Deleted team successfully`);
    },
    onError: (error: any) => {
      toast.error('Failed to delete team');
      console.error('Delete team error:', error);
    },
  });
}

/* -------------------- UPDATE TEAM WITH MEMBERS -------------------- */
export interface UpdateTeamWithMembersPayload {
  name?: string;
  description?: string;
  members?: {
    id?: string;
    name: string;
    email?: string;
  }[];
}
export const updateTeamWithMembers = async (
  teamId: string,
  payload: UpdateTeamWithMembersPayload
) => {
  try {
    const { data } = await axiosInstance.put(
      API_URLS.vendor.updateTeamWithMembers(teamId),
      payload
    );
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating team with members:', error);
    toast.error(error?.response?.data?.message || 'Failed to update team.');
    throw error;
  }
};

export function useUpdateTeamWithMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { teamId: string; payload: UpdateTeamWithMembersPayload }) =>
      updateTeamWithMembers(variables.teamId, variables.payload),
    onSuccess: (_, variables) => {
      toast.success('Team updated successfully!');
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEYS.vendor.getTeams] });
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEYS.vendor.getSingleTeam, variables.teamId],
      });
    },
    onError: (error: any) => {
      console.error('Failed to update team:', error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || 'Failed to update team.');
    },
  });
}

export interface VendorHomePageParams {
  page?: number;
  limit?: number;
  search?: string;
  serviceType?: string;
  minPrice?: number;
  maxPrice?: number;
}

const fetchVendors = async ({
  pageParam = 1,
  filters,
}: {
  pageParam?: number;
  filters?: VendorHomePageParams;
}): Promise<VendorHomePageResponse> => {
  try {
    const response = await axiosInstance.get(API_URLS.vendor.getHomePageVendors, {
      params: {
        page: pageParam,
        limit: filters?.limit || 10,
        search: filters?.search || '',
        serviceType: filters?.serviceType,
        minPrice: filters?.minPrice,
        maxPrice: filters?.maxPrice,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      toast.error(error?.response?.data?.message || 'Failed to fetch vendors.');
    } else {
      toast.error('Failed to fetch vendors.');
    }
    throw error;
  }
};

// export const useInfiniteVendorHomePage = (filters: VendorHomePageParams = {}) => {
//   return useInfiniteQuery({
//     queryKey: [API_QUERY_KEYS.vendor.getVendorsHomePage, filters],
//     queryFn: ({ pageParam = 1 }) => fetchVendors({ pageParam, filters }),
//     getNextPageParam: (lastPage) => {
//       const { pagination } = lastPage;
//       if (pagination.page * pagination.limit < pagination.total) {
//         return pagination.page + 1;
//       }
//       return undefined; // no more pages
//     },
//     keepPreviousData: true,
//     staleTime: 5 * 60 * 1000,
//   });
// };

export const useInfiniteVendorHomePage = (filters: VendorHomePageParams = {}) => {
  return useInfiniteQuery<
    VendorHomePageResponse, // Data type
    Error, // Error type
    VendorHomePageResponse, // Page type (same as data type here)
    [string, VendorHomePageParams], // Query key type
    number // 👈 Type of pageParam
  >({
    queryKey: [API_QUERY_KEYS.vendor.getVendorsHomePage, filters],
    queryFn: ({ pageParam }) => fetchVendors({ pageParam, filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (pagination.page * pagination.limit < pagination.total) {
        return pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};
