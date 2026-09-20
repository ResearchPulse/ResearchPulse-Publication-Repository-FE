'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SortOption {
  value: string;
  label: string;
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
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
  };

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
          <ul className="student-sort-dropdown__options">
            {options.map((option) => {
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
                  <span>{option.label}</span>
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
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
