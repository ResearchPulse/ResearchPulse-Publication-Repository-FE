import type { ReactNode } from 'react';

export interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
  return <section className={`ui-panel ${className}`.trim()}>{children}</section>;
}
