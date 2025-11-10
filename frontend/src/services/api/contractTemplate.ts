import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import { API_URLS, API_QUERY_KEYS } from '../apiBaseUrl';
import { toast } from 'sonner';

export interface SignatureField {
  id: string;
  page: number;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ContractTemplate {
  id: number;
  templateId: string;
  name: string;
  description?: string | null;
  htmlContent: string;
  type: string;
  isSystem: boolean;
  createdAt: string;
  signatureFields?: SignatureField[];
}

export interface GeneratePdfParams {
  templateId: string;
  coupleNames?: string;
  weddingDate?: string;
  venue?: string;
}
export interface SignatureField {
  id: string;
  type: string;
  x: number;
  y: number;
  page: number;
  width: number;
  height: number;
}

export interface SaveSignatureFieldsPayload {
  fields: SignatureField[];
  emails: string[];
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

export const saveSignatureFieldss = async (
  templateId: string,
  payload: SaveSignatureFieldsPayload
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      API_URLS.contractTemplate.saveSignatureFields(templateId),
      payload
    );
    toast.success('Signature fields saved and invites sent successfully');
    return response.data.data;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to save signature fields');
    throw error;
  }
};

export const useSaveSignatureFields = () => {
  return useMutation<any, any, { templateId: string; payload: SaveSignatureFieldsPayload }>({
    mutationFn: ({ templateId, payload }) => saveSignatureFieldss(templateId, payload),
  });
};

export const useCreateTemplate = () => {
  return;
};
