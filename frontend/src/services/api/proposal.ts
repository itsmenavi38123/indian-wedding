import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import { API_URLS, API_QUERY_KEYS } from '../apiBaseUrl';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export interface ProposalService {
  id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  order?: number;
}

export interface ProposalVersion {
  id: string;
  proposalId: string;
  snapshot: any;
  createdAt: string;
}

export interface WeddingPackageService {
  id: string;
  name: string;
  description?: string;
  price: number;
  order: number;
}

export interface WeddingPackage {
  id: string;
  name: string;
  description: string;
  totalPrice: number;
  category: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'LUXURY';
  isActive: boolean;
  isSystem: boolean;
  services: WeddingPackageService[];
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  reference: string;
  title: string;
  template: string;
  companyName: string;
  logoUrl?: string;
  dateISO: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  introHTML: string;
  termsText: string;
  paymentTerms: string;
  taxesPercent: number;
  discount: number;
  subtotal: number;
  grandTotal: number;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  services: ProposalService[];
  versions?: ProposalVersion[];
}

export interface ProposalDraftData {
  reference: string;
  title: string;
  template: string;
  companyName: string;
  logoUrl?: string;
  dateISO: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  introHTML: string;
  termsText: string;
  paymentTerms: string;
  taxesPercent: number;
  discount: number;
  services: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
  }[];
}

// Save or update draft
const saveProposalDraft = async ({ leadId, data }: { leadId: string; data: ProposalDraftData }) => {
  try {
    const response = await axiosInstance.post(API_URLS.proposal.saveDraft(leadId), data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error saving proposal draft:', error.response?.data);
      toast.error(error.response?.data?.errorMessage || 'Failed to save draft');
    }
    throw error;
  }
};

// Hook to save proposal draft
export const useSaveProposalDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveProposalDraft,
    onSuccess: (data) => {
      if (data?.data?.leadId) {
        // Invalidate the draft query for this lead
        queryClient.invalidateQueries({
          queryKey: [API_QUERY_KEYS.proposal.getDraft, data.data.leadId],
        });
      }
    },
  });
};

// Get draft for a lead
const getProposalDraft = async (leadId: string) => {
  try {
    const response = await axiosInstance.get(API_URLS.proposal.getDraft(leadId));
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // Return null if no draft found (404)
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching proposal draft:', error.response?.data);
    }
    throw error;
  }
};

// Hook to get proposal draft
export const useGetProposalDraft = (leadId: string) => {
  return useQuery({
    queryKey: [API_QUERY_KEYS.proposal.getDraft, leadId],
    queryFn: () => getProposalDraft(leadId),
    enabled: !!leadId && leadId !== 'unknown',
    retry: false,
  });
};

// Save proposal version
const saveProposalVersion = async ({
  proposalId,
  snapshot,
}: {
  proposalId: string;
  snapshot: any;
}) => {
  try {
    const response = await axiosInstance.post(API_URLS.proposal.saveVersion(proposalId), {
      snapshot,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error saving proposal version:', error.response?.data);
      toast.error(error.response?.data?.errorMessage || 'Failed to save version');
    }
    throw error;
  }
};

// Hook to save proposal version
export const useSaveProposalVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveProposalVersion,
    onSuccess: (data, variables) => {
      // Invalidate the draft query to refresh versions
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEYS.proposal.getDraft],
      });
      toast.success('Version saved successfully');
    },
  });
};

// Finalize proposal (change status from DRAFT to SENT)
const finalizeProposal = async (proposalId: string) => {
  try {
    const response = await axiosInstance.post(API_URLS.proposal.finalize(proposalId));
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error finalizing proposal:', error.response?.data);
      toast.error(error.response?.data?.errorMessage || 'Failed to finalize proposal');
    }
    throw error;
  }
};

// Hook to finalize proposal
export const useFinalizeProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finalizeProposal,
    onSuccess: (data) => {
      // Invalidate proposal queries
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEYS.proposal.getDraft],
      });
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEYS.proposal.getByLead],
      });
      toast.success('Proposal sent to client successfully!');
    },
  });
};

// Get all proposals
const getAllProposals = async (params?: {
  status?: string;
  search?: string;
}): Promise<Proposal[]> => {
  try {
    const response = await axiosInstance.get(API_URLS.proposal.getAll, { params });
    return response.data.data || [];
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error fetching proposals:', error.response?.data);
      toast.error(error.response?.data?.errorMessage || 'Failed to fetch proposals');
    }
    throw error;
  }
};

// Hook to get all proposals
export const useGetAllProposals = (params?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: [API_QUERY_KEYS.proposal.getAll, params],
    queryFn: () => getAllProposals(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get proposal by ID
const getProposalById = async (proposalId: string): Promise<Proposal> => {
  try {
    const response = await axiosInstance.get(API_URLS.proposal.getById(proposalId));
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error fetching proposal:', error.response?.data);
      toast.error(error.response?.data?.errorMessage || 'Failed to fetch proposal');
    }
    throw error;
  }
};

// Hook to get proposal by ID
export const useGetProposalById = (proposalId: string) => {
  return useQuery({
    queryKey: [API_QUERY_KEYS.proposal.getById, proposalId],
    queryFn: () => getProposalById(proposalId),
    enabled: !!proposalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Wedding Packages API
const getWeddingPackages = async (): Promise<WeddingPackage[]> => {
  try {
    const response = await axiosInstance.get('/proposals/packages');
    return response.data.data || [];
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error fetching wedding packages:', error.response?.data);
      toast.error(error.response?.data?.errorMessage || 'Failed to fetch wedding packages');
    }
    throw error;
  }
};

const getWeddingPackageById = async (packageId: string): Promise<WeddingPackage> => {
  try {
    const response = await axiosInstance.get(`/proposals/packages/${packageId}`);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error fetching wedding package:', error.response?.data);
      toast.error(error.response?.data?.errorMessage || 'Failed to fetch wedding package');
    }
    throw error;
  }
};

// Hook to get all wedding packages
export const useGetWeddingPackages = () => {
  return useQuery({
    queryKey: ['wedding-packages'],
    queryFn: getWeddingPackages,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
};

// Hook to get wedding package by ID
export const useGetWeddingPackageById = (packageId: string) => {
  return useQuery({
    queryKey: ['wedding-package', packageId],
    queryFn: () => getWeddingPackageById(packageId),
    enabled: !!packageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
