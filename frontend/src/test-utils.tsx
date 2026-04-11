import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '@/app/providers/app-provider';

export function createWrapper(initialEntries: string[] = ['/']) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <AppProvider>{children}</AppProvider>
      </MemoryRouter>
    );
  };
}
