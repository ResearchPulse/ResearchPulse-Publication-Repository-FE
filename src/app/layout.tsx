import '@hyperdata/design-system/styles.css';
import '@/features/admin/styles/admin-layout.css';
import '@/features/preprint/styles/preprint.css';
import '@/features/preprint/styles/paper-student.css';
import '@/features/landing/styles/paper-landing.css';
import '@/features/landing/styles/paper-portal.css';
import '@/styles/public-landing.css';
import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'Hyperdata Lab Preprint Repository',
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
    <html lang='en'>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js?token=c69b196a-83fc-4b51-90fc-beba432e86f9"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
