'use client';

import axios, { type AxiosRequestConfig, type Method } from 'axios';
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
    // 요청 취소는 정상적인 동작이므로 에러 로깅하지 않음
    if (axios.isCancel(error)) {
      throw error;
    }
    console.error('API 에러 발생', error);
    throw error;
  }
};
