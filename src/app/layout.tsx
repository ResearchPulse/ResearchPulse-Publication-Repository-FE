import '@hyperlabdata/ui/styles.css';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hyperdata Lab — Academic Gateway',
  description: 'A transparent academic gateway for student research, faculty review, and research milestones.',
  icons: {
    icon: [
      { url: '/hyperdata-lab-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/hyperdata-lab-logo.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
