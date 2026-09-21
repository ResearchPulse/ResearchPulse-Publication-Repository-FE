import Image from 'next/image';

interface HyperdataLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export function HyperdataLogo({
  className = '',
  size = 36,
  showText = true,
  variant = 'dark',
}: HyperdataLogoProps) {
  return (
    <span className={`pl-brand-lockup pl-brand-lockup--${variant} ${className}`} aria-label="HyperData Lab">
      <Image
        src="/hyperdata-lab-logo.png"
        alt="HyperData Lab Logo"
        width={size}
        height={size}
        className="pl-brand-logo-img"
        priority
      />
      {showText && <span className="pl-brand-name">HyperData Lab</span>}
    </span>
  );
}
