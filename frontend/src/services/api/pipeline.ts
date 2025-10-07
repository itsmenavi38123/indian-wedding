import axiosInstance from '../axiosInstance';
import { Lead } from '@/app/admin/pipeline/components/types';
import { API_URLS } from '../apiBaseUrl';

export interface PipelineFilters {
  assignee?: string;
  startDate?: string;
  endDate?: string;
  minBudget?: string;
  maxBudget?: string;
  status?: string;
}

export const pipelineApi = {
  getLeads: async (filters?: PipelineFilters): Promise<Lead[]> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_URLS.pipeline.getLeads}?${queryString}`
      : API_URLS.pipeline.getLeads;

    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  updateLeadStatus: async (id: string, status: string): Promise<Lead> => {
    const response = await axiosInstance.patch(API_URLS.pipeline.updateLeadStatus(id), { status });
    return response.data.data;
  },

  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    // Transform pipeline Lead format to backend format
    const updateData: any = {};

    if (data.couple) {
      const names = data.couple.split(' & ');
      updateData.partner1Name = names[0];
      updateData.partner2Name = names[1] || '';
    }

    if (data.weddingDate) {
      updateData.weddingDate = data.weddingDate;
    }

    if (data.budget !== undefined) {
      updateData.budget = data.budget;
    }

    if (data.stage) {
      updateData.status = data.stage;
    }

    // Handle assignee - would need to look up user ID in real implementation
    // For now, we'll just update by name

    const response = await axiosInstance.put(API_URLS.pipeline.updateLead(id), updateData);
    return response.data.data;
  },

  archiveLead: async (id: string): Promise<Lead> => {
    const response = await axiosInstance.delete(API_URLS.pipeline.archiveLead(id));
    return response.data.data;
  },
};
