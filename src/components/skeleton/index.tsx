import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'rect' | 'circle' | 'pill' | 'text' | 'btn';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Primitive Skeleton component with neutral shimmer animation
 */
export function Skeleton({
  width,
  height,
  borderRadius,
  variant = 'rect',
  className = '',
  style,
}: SkeletonProps) {
  let baseClass = 'skeleton';
  if (variant === 'circle') baseClass = 'skeleton-circle';
  else if (variant === 'pill') baseClass = 'skeleton-pill';
  else if (variant === 'btn') baseClass = 'skeleton-btn';

  const computedStyle: React.CSSProperties = {
    ...style,
    width: width ?? (variant === 'circle' ? '40px' : variant === 'pill' ? '64px' : '100%'),
    height: height ?? (variant === 'circle' ? '40px' : variant === 'pill' ? '24px' : variant === 'text' ? '14px' : '20px'),
    borderRadius: borderRadius ?? (variant === 'circle' ? '50%' : variant === 'pill' ? '9999px' : '6px'),
  };

  return <div className={`${baseClass} ${className}`.trim()} style={computedStyle} aria-hidden="true" />;
}

/**
 * Table Skeleton Rows for tabular views (Admin, Lecturer, Student)
 */
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  type?: 'users' | 'submissions' | 'reviews' | 'generic';
}

export function TableSkeleton({ rows = 5, columns = 5, type = 'generic' }: TableSkeletonProps) {
  const rowIndices = Array.from({ length: rows }, (_, i) => i);

  if (type === 'users') {
    return (
      <>
        {rowIndices.map((i) => (
          <tr key={i} className="skeleton-tr">
            {/* User Column (Avatar + Name + Email) */}
            <td>
              <div className="skeleton-user-cell">
                <Skeleton variant="circle" width={38} height={38} />
                <div className="skeleton-cell-stack" style={{ width: '60%' }}>
                  <Skeleton height={14} width="75%" />
                  <Skeleton height={11} width="90%" />
                </div>
              </div>
            </td>
            {/* Role Column */}
            <td>
              <Skeleton variant="pill" width={80} height={26} />
            </td>
            {/* Account Status Column */}
            <td>
              <Skeleton variant="pill" width={70} height={24} />
            </td>
            {/* Last Login Column */}
            <td>
              <Skeleton height={12} width={85} />
            </td>
            {/* Actions Column */}
            <td>
              <div className="skeleton-actions-cell">
                <Skeleton variant="btn" width={75} height={30} />
                <Skeleton variant="btn" width={85} height={30} />
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (type === 'submissions') {
    return (
      <>
        {rowIndices.map((i) => (
          <tr key={i} className="skeleton-tr">
            {/* Manuscript Title & SHA */}
            <td style={{ width: '45%' }}>
              <div className="skeleton-cell-stack">
                <Skeleton height={15} width={`${70 + (i % 3) * 10}%`} />
                <Skeleton height={11} width="40%" />
              </div>
            </td>
            {/* Author */}
            <td>
              <Skeleton height={13} width={110} />
            </td>
            {/* Version */}
            <td>
              <Skeleton variant="pill" width={46} height={22} />
            </td>
            {/* Updated */}
            <td>
              <Skeleton height={12} width={90} />
            </td>
            {/* Status */}
            <td>
              <Skeleton variant="pill" width={85} height={24} />
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (type === 'reviews') {
    return (
      <>
        {rowIndices.map((i) => (
          <tr key={i} className="skeleton-tr">
            {/* Manuscript Title & Meta */}
            <td style={{ width: '40%' }}>
              <div className="skeleton-cell-stack">
                <Skeleton height={15} width={`${75 + (i % 3) * 8}%`} />
                <Skeleton height={11} width="35%" />
              </div>
            </td>
            {/* Lecturer Reviewer */}
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Skeleton variant="circle" width={28} height={28} />
                <Skeleton height={13} width={95} />
              </div>
            </td>
            {/* Status */}
            <td>
              <Skeleton variant="pill" width={90} height={24} />
            </td>
            {/* Feedback snippet */}
            <td style={{ width: '25%' }}>
              <Skeleton height={13} width="85%" />
            </td>
            {/* Date / SLA */}
            <td>
              <Skeleton height={12} width={80} />
            </td>
          </tr>
        ))}
      </>
    );
  }

  // Generic columns
  const colIndices = Array.from({ length: columns }, (_, i) => i);
  return (
    <>
      {rowIndices.map((rowIndex) => (
        <tr key={rowIndex} className="skeleton-tr">
          {colIndices.map((colIndex) => (
            <td key={colIndex}>
              <Skeleton height={14} width={colIndex === 0 ? '70%' : '50%'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * Feedback Card Skeleton for StudentMentorFeedbackView
 */
export function FeedbackCardSkeleton({ count = 3 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {items.map((i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Skeleton variant="circle" width={42} height={42} />
              <div className="skeleton-cell-stack">
                <Skeleton height={15} width={160} />
                <Skeleton height={12} width={100} />
              </div>
            </div>
            <Skeleton variant="pill" width={110} height={28} />
          </div>
          <div className="skeleton-card-body" style={{ marginTop: '6px' }}>
            <Skeleton height={18} width="65%" style={{ marginBottom: '4px' }} />
            <Skeleton height={13} width="95%" />
            <Skeleton height={13} width="88%" />
            <Skeleton height={13} width="72%" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Skeleton variant="btn" width={110} height={34} />
            <Skeleton variant="btn" width={130} height={34} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Timeline Skeleton for Version Archive & Provenance views
 */
export function TimelineSkeleton({ count = 3 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="skeleton-timeline-container">
      {items.map((i) => (
        <div key={i} className="skeleton-timeline-item">
          <div className="skeleton-timeline-node skeleton" />
          <div className="skeleton-timeline-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Skeleton variant="pill" width={55} height={22} />
                <Skeleton height={14} width={180} />
              </div>
              <Skeleton height={12} width={120} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <Skeleton height={12} width={140} />
              <Skeleton height={12} width={90} />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <Skeleton variant="btn" width={100} height={28} />
              <Skeleton variant="btn" width={90} height={28} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Detail Page Skeleton for full-page views
 */
export function DetailSkeleton() {
  return (
    <div className="skeleton-detail-wrap" aria-hidden="true">
      {/* Hero Banner Skeleton */}
      <div className="skeleton-detail-hero">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Skeleton variant="pill" width={90} height={24} />
            <Skeleton height={12} width={140} />
          </div>
          <Skeleton variant="pill" width={100} height={26} />
        </div>
        <Skeleton height={26} width="75%" style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton variant="circle" width={28} height={28} />
          <Skeleton height={14} width={160} />
          <Skeleton height={12} width={110} />
        </div>
      </div>

      {/* Grid Layout (Main Content + Sidebar) */}
      <div className="skeleton-detail-grid">
        <div className="skeleton-detail-main">
          <Skeleton height={18} width={120} style={{ marginBottom: '8px' }} />
          <Skeleton height={14} width="100%" />
          <Skeleton height={14} width="96%" />
          <Skeleton height={14} width="92%" />
          <Skeleton height={14} width="65%" style={{ marginBottom: '16px' }} />

          <Skeleton height={18} width={150} style={{ margin: '16px 0 8px' }} />
          <Skeleton height={120} width="100%" borderRadius={8} />
        </div>

        <div className="skeleton-detail-sidebar">
          <Skeleton height={18} width={130} style={{ marginBottom: '8px' }} />
          <Skeleton height={36} width="100%" borderRadius={6} />
          <Skeleton height={36} width="100%" borderRadius={6} />
          <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />
          <Skeleton height={16} width={110} />
          <Skeleton height={13} width="80%" />
          <Skeleton height={13} width="70%" />
        </div>
      </div>
    </div>
  );
}

/**
 * Form / Editor Skeleton for PreprintEditorView
 */
export function FormSkeleton() {
  return (
    <div className="skeleton-detail-wrap" aria-hidden="true" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div className="skeleton-card">
        <Skeleton height={20} width={180} style={{ marginBottom: '12px' }} />
        <div className="skeleton-cell-stack" style={{ gap: '16px' }}>
          <div>
            <Skeleton height={14} width={100} style={{ marginBottom: '6px' }} />
            <Skeleton height={40} width="100%" borderRadius={6} />
          </div>
          <div>
            <Skeleton height={14} width={80} style={{ marginBottom: '6px' }} />
            <Skeleton height={40} width="100%" borderRadius={6} />
          </div>
          <div>
            <Skeleton height={14} width={70} style={{ marginBottom: '6px' }} />
            <Skeleton height={110} width="100%" borderRadius={6} />
          </div>
          <div>
            <Skeleton height={14} width={120} style={{ marginBottom: '6px' }} />
            <Skeleton height={90} width="100%" borderRadius={6} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <Skeleton variant="btn" width={90} height={36} />
          <Skeleton variant="btn" width={130} height={36} />
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Skeleton for AdminDashboardView
 */
export function DashboardMetricsSkeleton() {
  return (
    <div className="skeleton-metrics-grid" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-metric-card">
          <Skeleton variant="circle" width={42} height={42} />
          <div className="skeleton-cell-stack" style={{ flex: 1 }}>
            <Skeleton height={22} width={60} />
            <Skeleton height={12} width={110} />
          </div>
        </div>
      ))}
    </div>
  );
}
