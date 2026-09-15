import '@hyperlabdata/ui/styles.css';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hyperdata Lab Preprint — Academic Gateway',
  description: 'A transparent academic gateway for student preprints, faculty review, and research milestones.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
