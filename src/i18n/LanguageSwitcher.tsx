'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from './I18nContext';
import type { Locale } from './types';
import './LanguageSwitcher.css';

interface LanguageSwitcherProps {
  variant?: 'toggle' | 'dropdown';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'toggle',
  className = '',
}) => {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  if (variant === 'dropdown') {
    return (
      <div className={`lang-switcher-dropdown-container ${className}`} ref={containerRef}>
        <button
          type="button"
          className="lang-dropdown-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Select Language"
        >
          <span className="lang-flag">{locale === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
          <span className="lang-code">{locale.toUpperCase()}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isOpen && (
          <div className="lang-dropdown-menu">
            <button
              type="button"
              className={`lang-dropdown-item ${locale === 'vi' ? 'active' : ''}`}
              onClick={() => {
                setLocale('vi');
                setIsOpen(false);
              }}
            >
              <span>🇻🇳 Tiếng Việt</span>
              {locale === 'vi' && <span className="lang-check">✓</span>}
            </button>
            <button
              type="button"
              className={`lang-dropdown-item ${locale === 'en' ? 'active' : ''}`}
              onClick={() => {
                setLocale('en');
                setIsOpen(false);
              }}
            >
              <span>🇬🇧 English</span>
              {locale === 'en' && <span className="lang-check">✓</span>}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default 'toggle' pill variant
  return (
    <div className={`lang-switcher-toggle ${className}`} role="group" aria-label="Language selector">
      <button
        type="button"
        className={`lang-btn ${locale === 'vi' ? 'active' : ''}`}
        onClick={() => setLocale('vi')}
        title="Tiếng Việt"
      >
        <span className="lang-flag">🇻🇳</span>
        <span className="lang-code">VI</span>
      </button>
      <button
        type="button"
        className={`lang-btn ${locale === 'en' ? 'active' : ''}`}
        onClick={() => setLocale('en')}
        title="English"
      >
        <span className="lang-flag">🇬🇧</span>
        <span className="lang-code">EN</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
