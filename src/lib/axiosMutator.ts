'use client';

import type { AxiosRequestConfig, Method } from 'axios';
import { apiClient } from '@/lib/axios';

type CustomMutatorParams = {
  url: string;
  method: Method;
  params?: AxiosRequestConfig['params'];
  data?: AxiosRequestConfig['data'];
  headers?: AxiosRequestConfig['headers'];
  signal?: AbortSignal;
};

export const customMutator = async <T>({
  url,
  method,
  params,
  data,
  headers,
  signal,
}: CustomMutatorParams): Promise<T> => {
  try {
    const response = await apiClient.request<T>({
      url,
      method,
      params,
      data,
      headers,
      signal,
    });
    return response.data;
  } catch (error) {
    console.error('API 에러 발생', error);
    throw error;
  }
};
