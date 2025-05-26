import { apiClient } from '@/lib/axios';

type MutatorParams = {
  url: string
  method: string
  body?: any
  options?: any
}

export const customMutator = async ({ url, method, body, options }: MutatorParams) => {
  try {
    const res = await apiClient.request({
      url,
      method,
      data: body,
      ...options,
    })
    return res.data
  } catch (e) {
    // 공통 에러 로깅, 메시지 처리 가능
    console.error('API 에러 발생', e)
    throw e
  }
}
