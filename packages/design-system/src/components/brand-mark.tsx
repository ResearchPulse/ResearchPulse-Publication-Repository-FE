export interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export function BrandMark({ compact = false, className = '' }: BrandMarkProps) {
  return (
    <span className={`brand-lockup ${className}`.trim()} aria-label="Hyperdata Lab">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      {!compact && <span className="brand-name">hyperlabdata</span>}
    </span>
  );
}
