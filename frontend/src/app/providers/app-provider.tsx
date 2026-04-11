import type { PropsWithChildren } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionBootstrap } from '@/app/session-bootstrap';
import { RouterProvider, ToastProvider } from '@shared/ui/heroui';

const queryClient = new QueryClient();

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
