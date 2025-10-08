import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';
import { LeadStatus, SaveStatus } from '@/types/lead/Lead';
import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { LeadBoardColumn, LeadFilters } from '@/app/admin/kanban/pages/type';

export interface CreateLeadPayload {
  partner1Name?: string;
  partner2Name?: string;
  primaryContact?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  whatsappNumberSameAsPhoneNumber?: boolean;
  email?: string;
  weddingDate?: string | null;
  flexibleDates?: boolean;
  guestCountMin?: number;
  guestCountMax?: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocations?: string[];
  leadSource?: string;
  referralDetails?: string;
  initialNotes?: string;
  createdById?: string;
  saveStatus?: SaveStatus;
  serviceTypes?: string;
}

interface UpdateLeadStatusPayload {
  status: LeadStatus;
}

interface UpdateBulkLeadStatusPayload {
  status: LeadStatus;
  ids: string[];
}

interface ExportLeadWithIds {
  ids: string[];
}

interface UpdateLeadTeamAssignmentPayload {
  teamIdsByVendor: Record<string, string[]>;
}

const getLeads = async ({ queryKey }: { queryKey: any }) => {
  const [, { page, limit, sortBy, sortOrder, status, search, archived }] = queryKey;
  try {
    const { data } = await axiosInstance.get(API_URLS.lead.getLeads, {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        search,
        archived,
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

export function useGetLeads({
  page = 1,
  limit = 25,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  status = 'ALL',
  search = '',
  archived = false,
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
      API_QUERY_KEYS.lead.getLeads,
      { page, limit, sortBy, sortOrder, status, search, archived },
    ],
    queryFn: getLeads,
  });
}

const getLeadById = async ({ queryKey }: { queryKey: any }) => {
  const [, leadId] = queryKey;

  if (!leadId) {
    toast.error('Lead ID is required to fetch lead details.');
    throw new Error('Lead ID is required');
  }

  try {
    const { data } = await axiosInstance.get(`${API_URLS.lead.getSingleLeads(leadId)}`);

    return data;
  } catch (error: AxiosError | any) {
    console.error('Error fetching lead:', error);
    toast.error(error.message || 'Failed to fetch lead. Please try again later.');
    throw error;
  }
};

export function useGetLead(leadId?: string) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.lead.getSingleLead, leadId],
    queryFn: getLeadById,
    enabled: !!leadId,
  });
}

const getVendorsByLeadId = async ({ queryKey }: { queryKey: any }) => {
  const [, leadId] = queryKey;

  if (!leadId) {
    toast.error('Lead ID is required to fetch vendors related to lead.');
    throw new Error('Lead ID is required');
  }

  try {
    const { data } = await axiosInstance.get(`${API_URLS.lead.getVendorsByLead(leadId)}`);

    return data;
  } catch (error: AxiosError | any) {
    console.error('Error fetching vendors for lead :', error);
    toast.error(error.message || 'Failed to fetch vendors for lead. Please try again later.');
    throw error;
  }
};

export function useGetVendorsByLeadId(leadId?: string) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.lead.getVendorsByLeadId, leadId],
    queryFn: getVendorsByLeadId,
    enabled: !!leadId,
  });
}

export const createLead = async (payload: CreateLeadPayload) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.lead.create, payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error creating lead:', error);
    throw error;
  }
};

export const updateLead = async (leadId: string, payload: CreateLeadPayload) => {
  try {
    console.log(leadId);
    const { data } = await axiosInstance.post(API_URLS.lead.updateLeadById(leadId), payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error creating lead:', error);
    throw error;
  }
};

export const updateLeadStatus = async (leadId: string, payload: UpdateLeadStatusPayload) => {
  if (!leadId) {
    toast.error('Lead ID is required to update status.');
    throw new Error('Lead ID is required');
  }
  try {
    const { data } = await axiosInstance.post(API_URLS.lead.updateLeadStatus(leadId), payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating lead status:', error);
    throw error;
  }
};

export const updateLeadSaveStatus = async (leadId: string, archived = true) => {
  if (!leadId) {
    toast.error('Lead ID is required to update status.');
    throw new Error('Lead ID is required');
  }
  try {
    const { data } = await axiosInstance.post(API_URLS.lead.updateLeadSaveStatus(leadId), null, {
      params: { archived },
    });
    return data;
  } catch (error: AxiosError | any) {
    throw error;
  }
};

export const updateBulkLeadStatus = async (payload: UpdateBulkLeadStatusPayload) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.lead.bulkUpdateLeadStatus, payload);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating lead status:', error);
    throw error;
  }
};

export const exportLeadsWithIds = async (payload: ExportLeadWithIds) => {
  try {
    const response = await axiosInstance.post(API_URLS.lead.exportLeadsWithIdsCsv, payload, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Optional: filename from backend or fallback
    const fileName = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error: AxiosError | any) {
    console.error('Error updating lead status:', error);
    toast.error(error.response?.data?.message || 'Failed to update lead status.');
    throw error;
  }
};

export const updateLeadTeamAssignments = async (
  leadId: string,
  payload: UpdateLeadTeamAssignmentPayload
) => {
  if (!leadId) {
    toast.error('Lead ID is required to update team assignments.');
    throw new Error('Lead ID is required');
  }
  try {
    const { data } = await axiosInstance.post(API_URLS.lead.updateLeadById(leadId), payload);
    return data;
  } catch (error: AxiosError | any) {
    throw error;
  }
};

const toUTCStartOfDay = (date?: Date) => {
  if (!date) return undefined;
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)).toISOString();
};

const toUTCEndOfDay = (date?: Date) => {
  if (!date) return undefined;
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  ).toISOString();
};

export const fetchLeadsBoardData = async (filters?: LeadFilters): Promise<LeadBoardColumn[]> => {
  try {
    const params: Record<string, string> = {};

    if (filters?.search) params.search = filters.search;
    if (filters?.location) params.location = filters.location;
    if (filters?.budgetMin !== undefined) params.budgetMin = String(filters.budgetMin);
    if (filters?.budgetMax !== undefined) params.budgetMax = String(filters.budgetMax);

    const dateFromUTC = filters?.dateFrom ? toUTCStartOfDay(new Date(filters.dateFrom)) : undefined;
    if (dateFromUTC) params.dateFrom = dateFromUTC;

    const dateToUTC = filters?.dateTo ? toUTCEndOfDay(new Date(filters.dateTo)) : undefined;
    if (dateToUTC) params.dateTo = dateToUTC;

    const response = await axiosInstance.get(API_URLS.lead.getBoardLeads, { params });
    console.log(response.data.data);
    return response.data.data || [];
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      toast.error(error.response?.data?.message || 'Failed to fetch leads board data');
    } else {
      toast.error('Failed to fetch leads board data. Please try again later.');
    }
    throw error;
  }
};

// Hook
export const useLeadsBoardData = (filters?: LeadFilters): UseQueryResult<any, Error> => {
  return useQuery<any, Error, any, [string, LeadFilters?]>({
    queryKey: ['leadsBoard', filters],
    queryFn: () => fetchLeadsBoardData(filters),
  });
};
