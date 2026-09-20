'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SortOption {
  value: string;
  label: string;
  subLabel?: string;
  searchTerms?: string;
}

interface SortDropdownProps {
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
  id?: string;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  size?: 'sm' | 'md';
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function SortDropdown({
  value,
  options,
  onChange,
  id,
  ariaLabel,
  className = '',
  style,
  disabled = false,
  size = 'md',
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No matching options found',
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => {
      if (opt.value === '') return true; // keep "Select..." option if desired
      const labelMatch = opt.label.toLowerCase().includes(q);
      const subMatch = opt.subLabel ? opt.subLabel.toLowerCase().includes(q) : false;
      const termsMatch = opt.searchTerms ? opt.searchTerms.toLowerCase().includes(q) : false;
      return labelMatch || subMatch || termsMatch;
    });
  }, [options, searchable, searchQuery]);

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(isOpen ? { zIndex: 100 } : {}),
  };

  return (
    <div
      className={`student-sort-dropdown ${size === 'sm' ? 'student-sort-dropdown--sm' : ''} ${className}`}
      ref={containerRef}
      style={combinedStyle}
    >
      <button
        type="button"
        id={id}
        disabled={disabled}
        className={`student-sort-dropdown__trigger ${
          isOpen ? 'student-sort-dropdown__trigger--open' : ''
        } ${disabled ? 'student-sort-dropdown__trigger--disabled' : ''} ${
          size === 'sm' ? 'student-sort-dropdown__trigger--sm' : ''
        }`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        style={{ width: '100%' }}
      >
        <span>
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <svg
          className={`student-sort-dropdown__arrow ${isOpen ? 'student-sort-dropdown__arrow--open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="student-sort-dropdown__menu" role="listbox">
          {searchable && (
            <div className="student-sort-dropdown__search-wrap" onClick={(e) => e.stopPropagation()}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="student-sort-dropdown__search-icon"
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="student-sort-dropdown__search-input"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                  e.stopPropagation();
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="student-sort-dropdown__search-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <ul className="student-sort-dropdown__options">
            {filteredOptions.length === 0 ? (
              <li className="student-sort-dropdown__empty">
                {emptyMessage}
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`student-sort-dropdown__option ${
                      isSelected ? 'student-sort-dropdown__option--selected' : ''
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{option.label}</span>
                      {option.subLabel && (
                        <span style={{ fontSize: '11.5px', color: isSelected ? '#0071bc' : '#64748b', opacity: isSelected ? 0.85 : 1 }}>
                          {option.subLabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <svg
                        className="student-sort-dropdown__check"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

