import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { API_URLS } from '../apiBaseUrl';

export const updateSection1 = async (payload: FormData) => {
  try {
    const { data } = await axiosInstance.put(API_URLS.landingPage.updateSection1, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Section 1 updated successfully');
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating section 1:', error);
    toast.error(error.response?.data?.message || 'Failed to update Section 1.');
    throw error;
  }
};

export const updateSection2 = async (payload: FormData) => {
  try {
    const { data } = await axiosInstance.put(API_URLS.landingPage.updateSection2, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Section 2 updated successfully');
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating section 2:', error);
    toast.error(error.response?.data?.message || 'Failed to update Section 2.');
    throw error;
  }
};

export const updateSection3 = async (payload: FormData) => {
  try {
    const { data } = await axiosInstance.put(API_URLS.landingPage.updateSection3, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Section 3 updated successfully');
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating Section 3:', error);
    toast.error(error.response?.data?.message || 'Failed to update Section 3.');
    throw error;
  }
};
export const updateSection4 = async (payload: FormData) => {
  try {
    const { data } = await axiosInstance.put(API_URLS.landingPage.updateSection4, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Section 4 updated successfully');
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating section 4:', error);
    toast.error(error.response?.data?.message || 'Failed to update Section 4.');
    throw error;
  }
};

export const updateSection5 = async (payload: FormData) => {
  try {
    const { data } = await axiosInstance.put(API_URLS.landingPage.updateSection5, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Section 5 updated successfully');
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating Section 5:', error);
    toast.error(error.response?.data?.message || 'Failed to update Section 5.');
    throw error;
  }
};

export const updateSection6 = async (payload: { heading: string }) => {
  try {
    const { data } = await axiosInstance.put(API_URLS.landingPage.updateSection6, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    toast.success('Section 6 updated successfully');
    return data;
  } catch (error: AxiosError | any) {
    console.error('Error updating Section 6:', error);
    toast.error(error.response?.data?.message || 'Failed to update Section 6.');
    throw error;
  }
};
