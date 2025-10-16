import axiosInstance from '../axiosInstance';
import { API_URLS } from '../apiBaseUrl';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { CreateWeddingPlanPayload } from '@/types/weddingPlanner/weddingPlan';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const createWeddingPlan = async (payload: CreateWeddingPlanPayload) => {
  try {
    const { data } = await axiosInstance.post(API_URLS.weddingPlan.create, payload);
    toast.success('Wedding plan created successfully!');
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error creating wedding plan:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create wedding plan.');
    } else {
      console.error('Unknown error:', error);
      toast.error('Failed to create wedding plan. Please try again later.');
    }
    throw error;
  }
};

export function useCreateWeddingPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWeddingPlanPayload) => createWeddingPlan(payload),
    onSuccess: (data) => {
      toast.success('Wedding plan created successfully!');
      queryClient.invalidateQueries({ queryKey: ['weddingPlans'] });
      console.log('Wedding plan created:', data);
    },
    onError: (error: any) => {
      console.error('Error creating wedding plan:', error);
      toast.error(error?.response?.data?.message || 'Failed to create wedding plan.');
    },
  });
}
