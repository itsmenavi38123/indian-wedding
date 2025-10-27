import { toast } from 'sonner';
import axiosInstance from '../axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_QUERY_KEYS, API_URLS } from '../apiBaseUrl';
import { AxiosError } from 'axios';
import { UpdateTeamWithMembersPayload } from './vendors';

interface QueryParams {
  page: number;
  limit: number | 'all';
  search: string;
}

export const deleteAdminTeam = async (teamId: string) => {
  if (!teamId) throw new Error('Team ID is required for deletion');

  try {
    const { data } = await axiosInstance.delete(API_URLS.admin.deleteById(teamId));
    return data;
  } catch (error: any) {
    console.error('Error deleting admin team:', error);
    toast.error(error.response?.data?.message || 'Failed to delete admin team.');
    throw error;
  }
};

export function useDeleteAdminTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => deleteAdminTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEYS.admin.getTeams],
      });
      toast.success(`Deleted team successfully`);
    },
    onError: (error: any) => {
      toast.error('Failed to delete team');
      console.error('Delete team error:', error);
    },
  });
}

export const getAdminTeams = async ({ queryKey }: { queryKey: any }) => {
  const [, params = { page: 1, limit: 10, search: '' }] = queryKey;
  const { page, limit, search } = params as QueryParams;

  try {
    const response = await axiosInstance.get(API_URLS.admin.getTeams, {
      params: { page, limit, search },
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('[getAdminTeams] API error:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch teams.');
    } else {
      toast.error('Failed to fetch teams.');
    }
    throw error;
  }
};

interface AdminTeamsParams {
  page?: number;
  limit?: number | 'all';
  search?: string;
}

export const useGetAdminTeams = ({ page = 1, limit = 10, search = '' }: AdminTeamsParams = {}) => {
  return useQuery({
    queryKey: ['adminTeams', { page, limit, search }],
    queryFn: getAdminTeams,
  });
};

export const createAdminTeams = async (payload: FormData | Record<string, any>) => {
  try {
    const isFormData = payload instanceof FormData;
    const { data } = await axiosInstance.post(
      API_URLS.admin.createTeams,
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

export function useCreateAdminTeams() {
  return useMutation({
    mutationFn: createAdminTeams,
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

const getAdminTeamById = async ({ queryKey }: { queryKey: any }) => {
  const [, teamId] = queryKey;

  if (!teamId) {
    toast.error('Team ID is required to fetch team details.');
    throw new Error('Team ID is required');
  }

  const url = API_URLS.admin.getSingleTeam(teamId);
  console.log('[getAdminTeamById] Request URL:', url);
  try {
    const { data } = await axiosInstance.get(url);
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error fetching admin team:', error);
    toast.error(error.response?.data?.message || 'Failed to fetch team.');
    throw error;
  }
};

export function useGetAdminTeamById(teamId?: string) {
  return useQuery({
    queryKey: [API_QUERY_KEYS.admin.getSingleTeam, teamId],
    queryFn: getAdminTeamById,
    enabled: !!teamId,
  });
}

export const updateTeamWithMembers = async (
  teamId: string,
  payload: UpdateTeamWithMembersPayload
) => {
  try {
    const { data } = await axiosInstance.put(API_URLS.admin.updateTeamWithMembers(teamId), payload);
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
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEYS.admin.getTeams] });
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEYS.admin.getSingleTeam, variables.teamId],
      });
    },
    onError: (error: any) => {
      console.error('Failed to update team:', error?.response?.data || error.message);
      toast.error(error?.response?.data?.message || 'Failed to update team.');
    },
  });
}
