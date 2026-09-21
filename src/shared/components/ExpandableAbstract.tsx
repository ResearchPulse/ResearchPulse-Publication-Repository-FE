'use client';

import React, { useState } from 'react';

interface ExpandableAbstractProps {
  text?: string | null;
  locale?: string;
  clampLines?: number;
  fontSize?: string | number;
  lineHeight?: string | number;
  className?: string;
}

export const ExpandableAbstract: React.FC<ExpandableAbstractProps> = ({
  text,
  locale = 'vi',
  clampLines = 4,
  fontSize = '14.5px',
  lineHeight = 1.65,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || !text.trim()) {
    return (
      <p style={{ color: '#94a3b8', fontSize: '13.5px', fontStyle: 'italic', margin: 0 }}>
        {locale === 'vi' ? 'Không có nội dung tóm tắt.' : 'No abstract provided.'}
      </p>
    );
  }

  // Determine if content is long enough to warrant a show more/less toggle (~260 characters)
  const isLong = text.trim().length > 260;

  return (
    <div className={`expandable-abstract ${className}`}>
      <p
        style={{
          color: '#334155',
          fontSize,
          lineHeight,
          margin: 0,
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
          ...(!isExpanded && isLong
            ? {
                display: '-webkit-box',
                WebkitLineClamp: clampLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
            : {}),
        }}
      >
        {text}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            marginTop: '8px',
            background: 'none',
            border: 'none',
            padding: '4px 0',
            color: '#0071bc',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            outline: 'none',
          }}
          aria-expanded={isExpanded}
        >
          <span>
            {isExpanded
              ? locale === 'vi'
                ? 'Thu gọn'
                : 'Show less'
              : locale === 'vi'
              ? 'Xem thêm'
              : 'Read more'}
          </span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ExpandableAbstract;
