import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Apply interceptors ONLY on the client
if (typeof window !== 'undefined') {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }
  );
}

// Generic API request
export const apiRequest = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await api.request({
    method,
    url: endpoint,
    data,
    ...config,
  });
  return response.data;
};

export const get = <T = any>(endpoint: string, config?: AxiosRequestConfig) =>
  apiRequest<T>('GET', endpoint, undefined, config);

export const post = <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>('POST', endpoint, data, config);

export const put = <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>('PUT', endpoint, data, config);

export const del = <T = any>(endpoint: string, config?: AxiosRequestConfig) =>
  apiRequest<T>('DELETE', endpoint, undefined, config);

export default api;
