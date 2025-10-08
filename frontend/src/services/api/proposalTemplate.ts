import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import { API_URLS, API_QUERY_KEYS } from '../apiBaseUrl';
import { toast } from 'sonner';

export interface ProposalTemplateService {
  id?: string;
  name: string;
  description?: string;
  price: number;
  order?: number;
}

export interface ProposalTemplate {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  introHTML: string;
  termsText: string;
  isActive: boolean;
  isSystem: boolean;
  defaultServices: ProposalTemplateService[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  templateId: string;
  name: string;
  description?: string;
  introHTML: string;
  termsText: string;
  defaultServices?: ProposalTemplateService[];
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  introHTML?: string;
  termsText?: string;
  defaultServices?: ProposalTemplateService[];
}

// Get all templates
export const getAllTemplates = async (): Promise<ProposalTemplate[]> => {
  const response = await axiosInstance.get(API_URLS.proposalTemplate.getAll);
  return response.data.data;
};

// Hook to get all templates
export const useGetAllTemplates = () => {
  return useQuery({
    queryKey: [API_QUERY_KEYS.proposalTemplate.getAll],
    queryFn: getAllTemplates,
  });
};

// Get template by ID
export const getTemplateById = async (templateId: string): Promise<ProposalTemplate> => {
  const response = await axiosInstance.get(API_URLS.proposalTemplate.getById(templateId));
  return response.data.data;
};

// Hook to get template by ID
export const useGetTemplateById = (templateId: string) => {
  return useQuery({
    queryKey: [API_QUERY_KEYS.proposalTemplate.getById, templateId],
    queryFn: () => getTemplateById(templateId),
    enabled: !!templateId,
  });
};

// Create template
export const createTemplate = async (data: CreateTemplateData): Promise<ProposalTemplate> => {
  const response = await axiosInstance.post(API_URLS.proposalTemplate.create, data);
  return response.data.data;
};

// Hook to create template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEYS.proposalTemplate.getAll] });
      toast.success('Template created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create template');
      console.error('Error creating template:', error);
    },
  });
};

// Update template
export const updateTemplate = async (
  templateId: string,
  data: UpdateTemplateData
): Promise<ProposalTemplate> => {
  const response = await axiosInstance.put(API_URLS.proposalTemplate.update(templateId), data);
  return response.data.data;
};

// Hook to update template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: UpdateTemplateData }) =>
      updateTemplate(templateId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEYS.proposalTemplate.getAll] });
      queryClient.invalidateQueries({
        queryKey: [API_QUERY_KEYS.proposalTemplate.getById, variables.templateId],
      });
      toast.success('Template updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update template');
      console.error('Error updating template:', error);
    },
  });
};

// Delete template
export const deleteTemplate = async (templateId: string): Promise<void> => {
  const response = await axiosInstance.delete(API_URLS.proposalTemplate.delete(templateId));
  return response.data.data;
};

// Hook to delete template
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEYS.proposalTemplate.getAll] });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete template');
      console.error('Error deleting template:', error);
    },
  });
};

// Seed default templates
export const seedTemplates = async (): Promise<void> => {
  const response = await axiosInstance.post(API_URLS.proposalTemplate.seed);
  return response.data.data;
};

// Hook to seed templates
export const useSeedTemplates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedTemplates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEYS.proposalTemplate.getAll] });
      toast.success('Default templates initialized successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to initialize templates');
      console.error('Error seeding templates:', error);
    },
  });
};
