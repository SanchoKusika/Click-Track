import type { PropsWithChildren } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import i18n from '@shared/i18n/config';
import { SessionBootstrap } from '@/app/session-bootstrap';
import { RouterProvider, toast, ToastProvider } from '@shared/ui/heroui';

function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

function notifyError(error: unknown): void {
  if (isUnauthorized(error)) return;
  const message = error instanceof Error ? error.message : i18n.t('api.requestFailed');
  toast.danger(i18n.t('api.requestFailed'), { description: message });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (isUnauthorized(error)) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({ onError: notifyError }),
  mutationCache: new MutationCache({ onError: notifyError }),
});

export function AppProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const heroHref = useHref;

  return (
    <RouterProvider navigate={navigate} useHref={heroHref}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider />
        <SessionBootstrap>{children}</SessionBootstrap>
      </QueryClientProvider>
    </RouterProvider>
  );
}
