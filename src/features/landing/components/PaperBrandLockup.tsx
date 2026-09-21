type PaperBrandLockupProps = {
  className?: string;
  compact?: boolean;
};

export function PaperBrandLockup({ className = '', compact = false }: PaperBrandLockupProps) {
  return (
    <a className={'paper-brand-lockup ' + className} href="/" aria-label="HyperData Lab Preprint Repository">
      <img src="/images/hyperdata-lab-logo.png" alt="HyperData Lab" className="paper-brand-logo" />
      {!compact && <span className="paper-brand-divider">/</span>}
      {!compact && <span className="paper-brand-name">Preprint Repository</span>}
    </a>
  );
}
