import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import { API_URLS, API_QUERY_KEYS } from '../apiBaseUrl';
import { toast } from 'sonner';

export interface ContractTemplate {
  id: number;
  templateId: string;
  name: string;
  description?: string | null;
  htmlContent: string;
  type: string;
  isSystem: boolean;
  createdAt: string;
}

export interface GeneratePdfParams {
  templateId: string;
  coupleNames?: string;
  weddingDate?: string;
  venue?: string;
}

export const getAllContractTemplates = async (): Promise<ContractTemplate[]> => {
  const response = await axiosInstance.get(API_URLS.contractTemplate.getAll);
  return response.data.data;
};

export const getContractTemplateById = async (templateId: string): Promise<ContractTemplate> => {
  const response = await axiosInstance.get(API_URLS.contractTemplate.getById(templateId));
  return response.data.data;
};

export const generateContractPdf = async ({
  templateId,
  coupleNames,
  weddingDate,
  venue,
}: GeneratePdfParams): Promise<Blob> => {
  try {
    const response = await axiosInstance.get(API_URLS.contractTemplate.generatePdf(templateId), {
      params: { coupleNames, weddingDate, venue },
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to generate contract PDF');
    throw error;
  }
};

export const useGetAllContractTemplates = () => {
  return useQuery({
    queryKey: [API_QUERY_KEYS.contractTemplate.getAll],
    queryFn: getAllContractTemplates,
  });
};

export const useGetContractTemplateById = (templateId: string) => {
  return useQuery({
    queryKey: [API_QUERY_KEYS.contractTemplate.getById, templateId],
    queryFn: () => getContractTemplateById(templateId),
    enabled: !!templateId,
  });
};

export const useGenerateContractPdf = (params: GeneratePdfParams) => {
  return useQuery({
    queryKey: [API_QUERY_KEYS.contractTemplate.generatePdf, params],
    queryFn: async () => {
      const blob = await generateContractPdf(params);
      return URL.createObjectURL(blob);
    },
    enabled: !!params.templateId,
  });
};
