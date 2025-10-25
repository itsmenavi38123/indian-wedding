import { API_BASE_URL } from '@/lib/constant';
import axios from 'axios';

const API_URL = API_BASE_URL || 'http://localhost:3001/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      window.location.pathname.startsWith('/admin')
    ) {
      if (window.location.pathname.startsWith('/admin/login')) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/auth/admin/refresh-token`, {}, { withCredentials: true });
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      window.location.pathname.startsWith('/vendor')
    ) {
      if (window.location.pathname.startsWith('/vendor/login')) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/auth/vendor/refresh-token`, {}, { withCredentials: true });
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        window.location.href = '/vendor/login';
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      window.location.pathname.startsWith('/user')
    ) {
      if (window.location.pathname.startsWith('/user/login')) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/auth/user/refresh-token`, {}, { withCredentials: true });
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        window.location.href = '/user/login';
        return Promise.reject(refreshError);
      }
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      window.location.pathname.startsWith('/team-member')
    ) {
      if (window.location.pathname.startsWith('/team-member/login')) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        await axios.post(
          `${API_URL}/auth/team-member/refresh-token`,
          {},
          { withCredentials: true }
        );
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        window.location.href = '/team-member/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
