import type { ReactNode } from 'react';

export type AppRole = 'ADMIN' | 'MENTOR' | 'INTERN' | null;

export type Translate = (key: string, options?: Record<string, unknown>) => string;

export type NavItem = {
  href: string;
  label: string;
  icon: (isActive: boolean) => ReactNode;
  isActive: (pathname: string) => boolean;
};
