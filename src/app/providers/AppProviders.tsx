'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { QueryProvider } from './QueryProvider';

export interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}

export default AppProviders;
