import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export const BrandMark = ({ compact = false }: { compact?: boolean }) => (
  <span className="brand-lockup" aria-label="Hyperlabdata">
    <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
    {!compact && <span className="brand-name">hyperlabdata</span>}
  </span>
);

export const Button = ({ variant = 'primary', loading = false, children, className = '', disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; loading?: boolean }) => (
  <button className={`ui-button ui-button--${variant} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <span className="ui-button__spinner" aria-hidden="true" />}
    {children}
  </button>
);

export const StatusBadge = ({ status }: { status: string }) => {
  const label = status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  return <span className={`status-badge status-badge--${status.toLowerCase()}`}>{label}</span>;
};

export const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="ui-field">
    <span className="ui-field__label">{label}</span>
    {children}
    {hint && <span className="ui-field__hint">{hint}</span>}
  </label>
);

export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => <input className="ui-input" {...props} />;

export const TextArea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className="ui-textarea" {...props} />;

export const SelectInput = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select className="ui-select" {...props} />;

export const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => <section className={`ui-panel ${className}`}>{children}</section>;

export const EmptyState = ({ title, description, action }: { title: string; description: string; action?: ReactNode }) => (
  <div className="empty-state">
    <span className="empty-state__mark" aria-hidden="true">+</span>
    <h3>{title}</h3>
    <p>{description}</p>
    {action}
  </div>
);

export const ProgressBar = ({ value }: { value: number }) => <div className="progress-bar" aria-label={`${value}% complete`}><span style={{ width: `${value}%` }} /></div>;

export const Notice = ({ tone = 'info', title, children, className = '' }: { tone?: 'info' | 'success' | 'warning' | 'danger'; title?: string; children: ReactNode; className?: string }) => (
  <div className={`ui-notice ui-notice--${tone} ${className}`} role={tone === 'danger' ? 'alert' : 'status'}>
    {title && <strong>{title}</strong>}
    <span>{children}</span>
  </div>
);

export const LoadingState = ({ label = 'Loading' }: { label?: string }) => (
  <div className="ui-loading-state" role="status" aria-live="polite"><span className="ui-loading-state__spinner" aria-hidden="true" />{label}</div>
);

export const ErrorState = ({ title = 'Something went wrong', description, action }: { title?: string; description: string; action?: ReactNode }) => (
  <div className="ui-error-state" role="alert"><strong>{title}</strong><p>{description}</p>{action}</div>
);

export const PageHeader = ({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) => (
  <header className="ui-page-header">
    <div>
      {eyebrow && <p className="ui-page-header__eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="ui-page-header__description">{description}</p>}
    </div>
    {actions && <div className="ui-page-header__actions">{actions}</div>}
  </header>
);
