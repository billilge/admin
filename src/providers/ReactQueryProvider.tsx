/**
 * 하위 컴포넌트 트리에 React Query 기능을 적용
 * **/
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PropsWithChildren, useState } from 'react';

export function ReactQueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient()); // 최초 렌더링 시 한 번만 QueryClient 인스턴스를 생성하고, 이후 재사용되도록 useState를 사용해 보존

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
