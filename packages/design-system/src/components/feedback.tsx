import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__mark" aria-hidden="true">+</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-bar" aria-label={`${value}% complete`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

export interface NoticeProps {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Notice({ tone = 'info', title, children, className = '' }: NoticeProps) {
  return (
    <div className={`ui-notice ui-notice--${tone} ${className}`.trim()} role={tone === 'danger' ? 'alert' : 'status'}>
      {title && <strong>{title}</strong>}
      <span>{children}</span>
    </div>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="ui-loading-state" role="status" aria-live="polite">
      <span className="ui-loading-state__spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description: string;
  action?: ReactNode;
}

export function ErrorState({ title = 'Something went wrong', description, action }: ErrorStateProps) {
  return (
    <div className="ui-error-state" role="alert">
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}
