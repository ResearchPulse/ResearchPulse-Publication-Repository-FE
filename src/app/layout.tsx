import '@hyperdata/design-system/styles.css';
import '@/features/admin/styles/admin-layout.css';
import '@/features/lecturer/styles/lecturer-layout.css';
import '@/features/preprint/styles/preprint.css';
import '@/features/preprint/styles/paper-student.css';
import '@/features/landing/styles/paper-landing.css';
import '@/features/landing/styles/paper-portal.css';
import '@/styles/public-landing.css';
import '@/styles/auth-forms.css';
import '@/styles/skeleton.css';
import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'Hyperdata Lab',
  description: 'A public academic repository for early research, faculty mentorship, and transparent publication workflows.',
  icons: {
    icon: [
      { url: '/images/hyperdata-lab-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/images/hyperdata-lab-logo.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='vi' suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
