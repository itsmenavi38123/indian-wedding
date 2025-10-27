import axiosInstance from '../axiosInstance';
import { API_URLS } from '../apiBaseUrl';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { CreateWeddingPlanPayload } from '@/types/weddingPlanner/weddingPlan';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export type ServiceStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

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
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWeddingPlanPayload) => createWeddingPlan(payload),
    onSuccess: (data) => {
      toast.success('Wedding plan created successfully!');
      queryClient.invalidateQueries({ queryKey: ['weddingPlans'] });
      localStorage.removeItem('pendingWeddingPlan');
      localStorage.removeItem('currentStep');
      console.log('Wedding plan created:', data);
      router.push('/user/leads');
    },
    onError: (error: any) => {
      console.error('Error creating wedding plan:', error);
      toast.error(error?.response?.data?.message || 'Failed to create wedding plan.');
    },
  });
}

export const updateWeddingPlanServiceStatus = async (
  serviceId: string,
  status: ServiceStatus,
  reason?: string
) => {
  try {
    const { data } = await axiosInstance.patch(
      `${API_URLS.weddingPlan.updateServiceStatus(serviceId)}`,
      { status, reason }
    );
    toast.success('Status updated successfully!');
    return data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Error updating service status:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update service status.');
    } else {
      console.error('Unknown error:', error);
      toast.error('Failed to update service status. Please try again later.');
    }
    throw error;
  }
};

export function useUpdateWeddingPlanServiceStatus(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      status,
      reason,
    }: {
      serviceId: string;
      status: ServiceStatus;
      reason?: string;
    }) => updateWeddingPlanServiceStatus(serviceId, status, reason),
    onMutate: async ({ serviceId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['lead', leadId] });
      const previousData = queryClient.getQueryData<any>(['lead', leadId]);
      queryClient.setQueryData(['lead', leadId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            weddingPlan: {
              ...oldData.data.weddingPlan,
              services: oldData.data.weddingPlan.services.map((service: any) =>
                service.id === serviceId ? { ...service, status } : service
              ),
            },
          },
        };
      });
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['lead', leadId], context.previousData);
      }
      toast.error('Failed to update service status.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
    },
  });
}
