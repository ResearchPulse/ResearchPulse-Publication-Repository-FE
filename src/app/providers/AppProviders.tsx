'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { I18nProvider } from '@/i18n';
import { QueryProvider } from './QueryProvider';

export interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <I18nProvider>
        <AuthProvider>{children}</AuthProvider>
      </I18nProvider>
    </QueryProvider>
  );
}

export default AppProviders;
