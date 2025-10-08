import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { API_URLS } from '../apiBaseUrl';

export interface PipelineSummary {
  stage: string;
  count: number;
  totalBudget: number;
}

const fetchPipelineSummary = async (): Promise<PipelineSummary[]> => {
  try {
    const response = await axiosInstance.get(API_URLS.pipeline.getLeads);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error fetching pipeline summary:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch pipeline summary');
    } else {
      console.error('Unknown error:', error);
      toast.error('Failed to fetch pipeline summary. Please try again later.');
    }
    throw error;
  }
};

export const pipelineService = {
  fetchPipelineSummary,
};
