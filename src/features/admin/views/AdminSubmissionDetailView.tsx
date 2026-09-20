'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel, StatusBadge } from '@hyperdata/design-system';
import { AdminShell, AdminPageHeader } from '../components';
import {
  adminApi,
  type AdminPublication,
  type AdminPublicationStatus,
  type AdminReview,
  type AdminTimelineEvent,
  type AdminVersion,
  type AdminUser,
  type AdminPublicationAudience,
} from '../api';
import type { PreprintStatus } from '@/shared/types';
import { ROUTES } from '@/app/router';

export interface AdminSubmissionDetailViewProps {
  id: string;
}

function badgeStatus(status: AdminPublicationStatus): PreprintStatus {
  switch (status) {
    case 'REVIEWING':
      return 'UNDER_REVIEW';
    case 'PUBLISHED':
      return 'PUBLISHED';
    case 'REJECTED':
      return 'REJECTED';
    case 'DRAFTING':
      return 'NEEDS_REVISION';
    case 'PROCESSING':
    default:
      return 'DRAFT';
  }
}

function formatVersionLabel(versionLabel?: string | null, versionNumber?: number | null) {
  if (versionLabel) {
    return versionLabel.startsWith('v') ? versionLabel : `v${versionLabel}`;
  }
  if (typeof versionNumber === 'number') {
    return `v${versionNumber}`;
  }
  return 'v1.0';
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '—';
}

function recommendationLabel(value?: AdminReview['recommendation']) {
  if (!value) return 'Not submitted';
  if (value === 'NEEDS_REVISION') return 'Needs revision';
  if (value === 'PUBLISH') return 'Recommend publish';
  return 'Recommend reject';
}

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Size unavailable';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function truncateHash(hash?: string | null) {
  if (!hash) return null;
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

function fileNameFromObjectKey(objectKey?: string) {
  if (!objectKey) return undefined;
  return objectKey.split('/').pop() || objectKey;
}

interface ReviewListProps {
  reviews: AdminReview[];
  round?: number;
  isPastRound?: boolean;
}

function ReviewCommentItem({ comment }: { comment: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = comment.length > 120 || comment.includes('\n');

  return (
    <div className="simple-reviewer-item__comment-wrapper">
      <div className={`simple-reviewer-item__comment ${isLong && !expanded ? 'simple-reviewer-item__comment--clamped' : ''}`}>
        &ldquo;{comment}&rdquo;
      </div>
      {isLong && (
        <button
          type="button"
          className="simple-reviewer-item__toggle-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less ▴' : 'Show more ▾'}
        </button>
      )}
    </div>
  );
}

function ReviewList({ reviews, round, isPastRound }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <div className="preview-note" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b', marginBottom: '20px' }}>
        No faculty mentor reviews have been submitted yet.
      </div>
    );
  }

  const totalReviews = reviews.length;
  const submittedReviews = reviews.filter((r) => Boolean(r.submittedAt || r.recommendation)).length;

  // Ensure Primary Lecturer appears at the top
  const sortedReviews = [...reviews].sort((a, b) => {
    if (a.assignmentRole === 'PRIMARY') return -1;
    if (b.assignmentRole === 'PRIMARY') return 1;
    return 0;
  });

  return (
    <div className="simple-reviewer-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isPastRound ? `Committee · Round ${round || 1}` : 'Reviewers'}
        </span>
        <span style={{ fontSize: '11.5px', color: '#64748b' }}>
          {submittedReviews} of {totalReviews} submitted
        </span>
      </div>

      {sortedReviews.map((review) => {
        const isPrimary = review.assignmentRole === 'PRIMARY';
        const isNeedsRevision = review.recommendation === 'NEEDS_REVISION';
        const isPublish = review.recommendation === 'PUBLISH';
        const isReject = review.recommendation === 'REJECT';
        const initials = review.reviewer?.name
          ?.split(' ')
          .map((n) => n[0])
          .filter(Boolean)
          .slice(-2)
          .join('')
          .toUpperCase() || (isPrimary ? 'PL' : 'SR');

        return (
          <div className="simple-reviewer-item" key={review.id}>
            <div className="simple-reviewer-item__main">
              <div className="simple-reviewer-item__left">
                <div className="simple-reviewer-item__avatar">
                  {initials}
                </div>
                <div className="simple-reviewer-item__info">
                  <div className="simple-reviewer-item__name-line">
                    <span className="simple-reviewer-item__name">
                      {review.reviewer?.name || review.reviewer?.email || review.reviewerId}
                    </span>
                    <span
                      className={`simple-reviewer-item__role-tag ${
                        isPrimary
                          ? 'simple-reviewer-item__role-tag--primary'
                          : 'simple-reviewer-item__role-tag--secondary'
                      }`}
                    >
                      {isPrimary ? 'Primary' : 'Secondary'}
                    </span>
                  </div>
                  <p className="simple-reviewer-item__sub">
                    {isPrimary ? 'Decision Lead' : 'Independent Reviewer'} · {formatDate(review.submittedAt || review.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="simple-reviewer-item__badge">
                {isNeedsRevision && (
                  <span className="user-badge user-badge--revision" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                    Needs Revision
                  </span>
                )}
                {isPublish && (
                  <span className="user-badge user-badge--approved" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                    Recommend Publish
                  </span>
                )}
                {isReject && (
                  <span className="user-badge user-badge--withdrawn" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                    Recommend Reject
                  </span>
                )}
                {!review.recommendation && (
                  <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    Pending
                  </span>
                )}
              </div>
            </div>

            {review.comment && (
              <ReviewCommentItem comment={review.comment} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function VersionList({ versions }: { versions: AdminVersion[] }) {
  if (!versions.length) {
    return <p style={{ color: '#64748b', fontSize: '13.5px' }}>No version history recorded.</p>;
  }

  return (
    <div className="version-card-list">
      {versions.map((version) => (
        <div className="version-card-item" key={version.id}>
          <div className="version-card-left">
            <span className={`version-pill ${version.isCurrent ? 'version-pill--current' : ''}`}>
              {version.versionLabel} {version.isCurrent ? '· Current' : '· Archived'}
            </span>
            <div>
              <h4 className="version-card-title">{version.fileName}</h4>
              <div className="version-card-meta">
                <span>{formatDate(version.createdAt)}</span>
                {version.fileSize && <span>· {formatFileSize(version.fileSize)}</span>}
                {version.sha256 && (
                  <span className="pdf-asset-hash" title={version.sha256}>
                    SHA: {truncateHash(version.sha256)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {version.downloadUrl && (
            <a
              href={version.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="student-btn student-btn--secondary student-btn--sm"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

interface TimelineRoundGroup {
  roundKey: string;
  roundLabel: string;
  versionLabel: string;
  isLatest: boolean;
  events: AdminTimelineEvent[];
}

function groupTimelineEvents(events: AdminTimelineEvent[]): TimelineRoundGroup[] {
  if (!events.length) return [];

  let currentRoundNum = 1;
  const annotated: { event: AdminTimelineEvent; round: number }[] = [];

  for (const ev of events) {
    if (ev.version) {
      const match = ev.version.match(/v?(\d+)/i);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (parsed > currentRoundNum) {
          currentRoundNum = parsed;
        }
      }
    }
    annotated.push({ event: ev, round: currentRoundNum });
  }

  const roundMap = new Map<number, AdminTimelineEvent[]>();
  for (const { event, round } of annotated) {
    if (!roundMap.has(round)) {
      roundMap.set(round, []);
    }
    roundMap.get(round)!.push(event);
  }

  const sortedRounds = Array.from(roundMap.keys()).sort((a, b) => b - a);
  const maxRound = sortedRounds.length > 0 ? Math.max(...sortedRounds) : 1;

  return sortedRounds.map((round) => ({
    roundKey: `round-${round}`,
    roundLabel: `Round ${round}`,
    versionLabel: `v${round}`,
    isLatest: round === maxRound,
    events: roundMap.get(round) || [],
  }));
}

function TimelineList({ events }: { events: AdminTimelineEvent[] }) {
  if (!events.length) {
    return <p style={{ color: '#64748b', fontSize: '13.5px' }}>No audit timeline events logged.</p>;
  }

  const groups = useMemo(() => groupTimelineEvents(events), [events]);
  const [openRounds, setOpenRounds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (groups.length > 0) {
      initial[groups[0].roundKey] = true;
    }
    return initial;
  });

  const toggleRound = (roundKey: string) => {
    setOpenRounds((prev) => ({ ...prev, [roundKey]: !prev[roundKey] }));
  };

  const allOpen = groups.length > 0 && groups.every((g) => openRounds[g.roundKey]);
  const toggleAll = () => {
    const nextState = !allOpen;
    const next: Record<string, boolean> = {};
    for (const g of groups) {
      next[g.roundKey] = nextState;
    }
    setOpenRounds(next);
  };

  if (groups.length <= 1) {
    return (
      <div className="audit-timeline-container">
        {events.map((event) => (
          <div className="audit-timeline-entry" key={event.id}>
            <div className="audit-timeline-node" />
            <div className="audit-timeline-header">
              <span className="audit-timeline-title">{event.title}</span>
              <span className="audit-timeline-actor">{event.actor}</span>
            </div>
            <p className="audit-timeline-desc">{event.description}</p>
            <span className="audit-timeline-time">{formatDate(event.timestamp)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="audit-timeline-accordion-wrapper">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={toggleAll}
          style={{
            fontSize: '12px',
            color: '#0071bc',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            padding: '2px 4px',
          }}
        >
          {allOpen ? 'Collapse all rounds' : 'Expand all rounds'}
        </button>
      </div>
      <div className="audit-timeline-accordion-list">
        {groups.map((group) => {
          const isOpen = Boolean(openRounds[group.roundKey]);
          return (
            <div
              key={group.roundKey}
              className={`audit-timeline-round-card ${group.isLatest ? 'audit-timeline-round-card--latest' : ''}`}
            >
              <button
                type="button"
                className="audit-timeline-round-header"
                onClick={() => toggleRound(group.roundKey)}
                aria-expanded={isOpen}
              >
                <div className="audit-timeline-round-header__left">
                  <span
                    className={`audit-timeline-round-badge ${
                      group.isLatest ? 'audit-timeline-round-badge--current' : ''
                    }`}
                  >
                    {group.roundLabel} ({group.versionLabel})
                  </span>
                  {group.isLatest && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#059669',
                        background: '#d1fae5',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      Current
                    </span>
                  )}
                  <span className="audit-timeline-round-count">
                    {group.events.length} event{group.events.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {isOpen ? 'Hide details' : 'Show details'}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`audit-timeline-round-chevron ${isOpen ? 'audit-timeline-round-chevron--open' : ''}`}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>
              {isOpen && (
                <div className="audit-timeline-round-body">
                  <div className="audit-timeline-container" style={{ margin: '6px 0 0' }}>
                    {group.events.map((event) => (
                      <div className="audit-timeline-entry" key={event.id}>
                        <div className="audit-timeline-node" />
                        <div className="audit-timeline-header">
                          <span className="audit-timeline-title">{event.title}</span>
                          <span className="audit-timeline-actor">{event.actor}</span>
                        </div>
                        <p className="audit-timeline-desc">{event.description}</p>
                        <span className="audit-timeline-time">{formatDate(event.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LecturerSearchableSelectProps {
  lecturers: AdminUser[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

function LecturerSearchableSelect({
  lecturers,
  value,
  onChange,
  disabled,
}: LecturerSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLecturer = useMemo(
    () => lecturers.find((l) => l.id === value),
    [lecturers, value]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return lecturers;
    return lecturers.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q))
    );
  }, [lecturers, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setSearchQuery('');
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.split(' ').filter(Boolean);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    return (email?.slice(0, 2) || 'LE').toUpperCase();
  };

  return (
    <div className="admin-searchable-select" ref={containerRef}>
      <button
        type="button"
        id="primary-reviewer"
        className={`admin-searchable-select__trigger ${isOpen ? 'admin-searchable-select__trigger--open' : ''} ${disabled ? 'admin-searchable-select__trigger--disabled' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="admin-searchable-select__trigger-content">
          {selectedLecturer ? (
            <div className="admin-searchable-select__selected-item">
              <span className="admin-searchable-select__avatar">
                {getInitials(selectedLecturer.name, selectedLecturer.email)}
              </span>
              <div className="admin-searchable-select__selected-text">
                <span className="admin-searchable-select__selected-name">
                  {selectedLecturer.name || selectedLecturer.email.split('@')[0]}
                </span>
                <span className="admin-searchable-select__selected-email">
                  {selectedLecturer.email}
                </span>
              </div>
            </div>
          ) : (
            <span className="admin-searchable-select__placeholder">
              Select primary lecturer...
            </span>
          )}
        </div>
        <svg
          className={`admin-searchable-select__arrow ${isOpen ? 'admin-searchable-select__arrow--open' : ''}`}
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
        <div className="admin-searchable-select__dropdown" role="listbox">
          <div className="admin-searchable-select__search-wrapper">
            <svg
              className="admin-searchable-select__search-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="admin-searchable-select__search-input"
              placeholder="Search lecturer by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                className="admin-searchable-select__search-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
              >
                ×
              </button>
            )}
          </div>

          <ul className="admin-searchable-select__options">
            {filtered.length > 0 ? (
              filtered.map((lecturer) => {
                const isSelected = lecturer.id === value;
                return (
                  <li
                    key={lecturer.id}
                    role="option"
                    aria-selected={isSelected}
                    className={`admin-searchable-select__option ${
                      isSelected ? 'admin-searchable-select__option--selected' : ''
                    }`}
                    onClick={() => handleSelect(lecturer.id)}
                  >
                    <div className="admin-searchable-select__option-left">
                      <span className="admin-searchable-select__avatar admin-searchable-select__avatar--small">
                        {getInitials(lecturer.name, lecturer.email)}
                      </span>
                      <div className="admin-searchable-select__option-info">
                        <span className="admin-searchable-select__option-name">
                          {lecturer.name || lecturer.email.split('@')[0]}
                        </span>
                        <span className="admin-searchable-select__option-email">
                          {lecturer.email}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <svg
                        className="admin-searchable-select__check"
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
            ) : (
              <li className="admin-searchable-select__option--empty">
                No lecturers found matching &ldquo;{searchQuery}&rdquo;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function AdminSubmissionDetailView({ id }: AdminSubmissionDetailViewProps) {
  const [publication, setPublication] = useState<AdminPublication | null>(null);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [pastReviews, setPastReviews] = useState<AdminReview[]>([]);
  const [showPastReviews, setShowPastReviews] = useState(false);
  const [loadingPastReviews, setLoadingPastReviews] = useState(false);
  const [versions, setVersions] = useState<AdminVersion[]>([]);
  const [timeline, setTimeline] = useState<AdminTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [lecturers, setLecturers] = useState<AdminUser[]>([]);
  const [primaryReviewerId, setPrimaryReviewerId] = useState('');
  const [secondaryReviewerIds, setSecondaryReviewerIds] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<AdminPublicationAudience[]>([]);
  const [assignmentBusy, setAssignmentBusy] = useState(false);
  const [visibilityBusy, setVisibilityBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setHistoryError(null);

    Promise.allSettled([
      adminApi.getSubmission(id),
      adminApi.getReviews(id, 'current'),
      adminApi.getVersions(id),
      adminApi.getTimeline(id),
    ]).then(([publicationResult, reviewsResult, versionsResult, timelineResult]) => {
      if (!active) return;

      if (publicationResult.status === 'rejected') {
        setError(publicationResult.reason instanceof Error ? publicationResult.reason.message : 'Unable to load manuscript.');
      } else {
        setPublication(publicationResult.value);
      }

      const optionalFailures: string[] = [];
      if (reviewsResult.status === 'fulfilled') {
        setReviews(reviewsResult.value);
        const primary = reviewsResult.value.find((review) => review.assignmentRole === 'PRIMARY');
        const secondary = reviewsResult.value
          .filter((review) => review.assignmentRole === 'SECONDARY')
          .map((review) => review.reviewerId);
        setPrimaryReviewerId(primary?.reviewerId || '');
        setSecondaryReviewerIds(secondary);
      } else {
        optionalFailures.push('reviews');
      }
      if (versionsResult.status === 'fulfilled') setVersions(versionsResult.value);
      else optionalFailures.push('versions');
      if (timelineResult.status === 'fulfilled') setTimeline(timelineResult.value);
      else optionalFailures.push('timeline');

      if (optionalFailures.length) {
        setHistoryError(`Some panels are unavailable: ${optionalFailures.join(', ')}.`);
      }
      if (publicationResult.status === 'fulfilled') {
        setAudiences(publicationResult.value.audiences || []);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    adminApi.listLecturers()
      .then((result) => setLecturers(result.users))
      .catch(() => setLecturers([]));
  }, []);

  const changeStatus = async (status: 'PUBLISHED' | 'REJECTED' | 'DRAFTING') => {
    const actionLabel = status === 'PUBLISHED' ? 'publish' : status === 'DRAFTING' ? 'request revision for' : 'reject';
    if (!publication || !window.confirm(`Confirm action to ${actionLabel} this manuscript?`)) return;
    const reason = window.prompt('Admin backup reason (required for audit timeline):', 'Editorial decision recorded by Admin backup.')?.trim();
    if (!reason) return;

    setBusy(true);
    setMessage(null);
    try {
      const updated = await adminApi.changeStatus(id, status, reason);
      setPublication((current) => current ? { ...current, ...updated, status } : current);
      setMessage(`Manuscript successfully moved to ${status}.`);
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to change manuscript status.');
    } finally {
      setBusy(false);
    }
  };

  const assignReviewers = async () => {
    if (!primaryReviewerId || secondaryReviewerIds.length !== 2) {
      setMessage('Select exactly one primary lecturer and two secondary lecturers.');
      return;
    }
    setAssignmentBusy(true);
    setMessage(null);
    try {
      const assigned = await adminApi.assignReviewers(id, primaryReviewerId, secondaryReviewerIds);
      setReviews(assigned);
      setPastReviews([]);
      setMessage('Primary and secondary lecturers assigned for this review round.');
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to assign lecturers.');
    } finally {
      setAssignmentBusy(false);
    }
  };

  const togglePastReviews = async () => {
    if (showPastReviews) {
      setShowPastReviews(false);
      return;
    }
    setShowPastReviews(true);
    if (pastReviews.length === 0) {
      setLoadingPastReviews(true);
      try {
        const all = await adminApi.getReviews(id, 'all');
        setPastReviews(all);
      } catch {
        // Silent catch for history loading
      } finally {
        setLoadingPastReviews(false);
      }
    }
  };

  const currentRound = reviews[0]?.round || publication?.currentVersion?.version || 1;

  const pastRounds = useMemo(() => {
    if (!pastReviews.length) return [];
    const roundsMap = new Map<number, AdminReview[]>();
    for (const r of pastReviews) {
      if (r.round < currentRound) {
        const list = roundsMap.get(r.round) || [];
        list.push(r);
        roundsMap.set(r.round, list);
      }
    }
    return Array.from(roundsMap.entries()).sort(([a], [b]) => b - a);
  }, [pastReviews, currentRound]);

  const saveVisibility = async () => {
    setVisibilityBusy(true);
    setMessage(null);
    try {
      const updated = await adminApi.updateVisibility(id, audiences);
      setPublication((current) => current ? { ...current, ...updated } : current);
      setMessage('Audience visibility saved.');
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to save audience visibility.');
    } finally {
      setVisibilityBusy(false);
    }
  };

  const toggleSecondaryReviewer = (reviewerId: string) => {
    setSecondaryReviewerIds((current) => current.includes(reviewerId)
      ? current.filter((idValue) => idValue !== reviewerId)
      : current.length < 2 ? [...current, reviewerId] : current);
  };

  return (
    <AdminShell active="submissions" title="Submission detail">
      <AdminPageHeader
        eyebrow="Editorial record"
        title={publication?.title || 'Submission detail'}
        description="Read the manuscript record, monitor peer review progress, and exercise administrative backup controls when required."
      />
      <div className="admin-detail-top-nav">
        <Link className="admin-back-btn" href={ROUTES.ADMIN.SUBMISSIONS}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to submissions</span>
        </Link>
      </div>

      {loading && <div className="preview-note" role="status">Loading manuscript record...</div>}
      {error && <div className="preview-note" role="alert">Unable to load manuscript: {error}</div>}
      {historyError && !error && <div className="preview-note" role="status">{historyError}</div>}

      {publication && (
        <div className="detail-grid">
          {/* Left Panel: Manuscript Record, Authors, Versions, Timeline */}
          <Panel className="detail-panel">
            <div className="manuscript-meta-strip">
              <div className="manuscript-meta-strip__left">
                <span className="manuscript-meta-pill">
                  {formatVersionLabel(publication.currentVersion?.versionLabel, publication.currentVersion?.version)}
                </span>
                <span className="manuscript-meta-tag">Student Research</span>
                <span className="manuscript-meta-date">
                  Updated {formatDate(publication.updatedAt)}
                </span>
                {publication.uploader?.email && (
                  <span className="manuscript-meta-uploader">
                    Author: {publication.uploader?.name || publication.uploader?.email}
                  </span>
                )}
              </div>
              <div className="manuscript-meta-strip__right">
                <StatusBadge status={badgeStatus(publication.status)} />
              </div>
            </div>

            {/* Abstract */}
            <div className="manuscript-abstract-box">
              <div className="manuscript-abstract-label">Abstract</div>
              <p className="manuscript-abstract-text">{publication.abstract || 'No abstract provided for this manuscript.'}</p>
            </div>

            {/* Primary PDF Asset */}
            {publication.downloadUrl && (
              <div className="pdf-asset-card">
                <div className="pdf-asset-info">
                  <div className="pdf-asset-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="pdf-asset-name">
                      {publication.currentVersion?.fileName || fileNameFromObjectKey(publication.objectKey) || 'Manuscript PDF'}
                    </h4>
                    <div className="pdf-asset-meta">
                      <span>{formatFileSize(publication.fileSize)}</span>
                      {publication.currentVersion?.versionLabel && (
                        <span>· Version {publication.currentVersion.versionLabel}</span>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={publication.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="student-btn student-btn--primary student-btn--sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download PDF</span>
                </a>
              </div>
            )}

            {/* Authors */}
            <h3>Contributing Authors</h3>
            <div className="authors-chip-grid">
              {publication.authors && publication.authors.length > 0 ? (
                publication.authors.map((author, idx) => (
                  <div className="author-chip" key={author.id || idx}>
                    <div className="author-chip-avatar">{author.name.charAt(0).toUpperCase()}</div>
                    <div className="author-chip-info">
                      <span className="author-chip-name">{author.name}</span>
                      {author.affiliation && <span className="author-chip-affil">{author.affiliation}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>No author data available.</p>
              )}
            </div>
            {/* Audit Timeline */}
            <h3>Audit Timeline</h3>
            <TimelineList events={timeline} />
          </Panel>

          {/* Right Panel: Review Progress & Admin Decision */}
          <div className="detail-grid__sidebar">
            <Panel className="detail-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h2 style={{ margin: 0 }}>Peer Review Progress</h2>
                <span className="manuscript-meta-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  Round {currentRound} · {formatVersionLabel(publication.currentVersion?.versionLabel, publication.currentVersion?.version || currentRound)}
                </span>
              </div>
              <p className="abstract">
                One primary lecturer decides the workflow; two secondary lecturers provide independent review evidence.
              </p>
              <ReviewList reviews={reviews} round={currentRound} />

              {(publication.currentVersion?.version || 1) > 1 && (
                <div style={{ marginTop: '16px', marginBottom: '18px' }}>
                  <button
                    type="button"
                    onClick={togglePastReviews}
                    className="student-btn student-btn--secondary student-btn--sm"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: showPastReviews ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <span>
                      {showPastReviews ? 'Hide earlier review rounds' : `View earlier review rounds (${(publication.currentVersion?.version || 1) - 1} prior)`}
                    </span>
                  </button>

                  {showPastReviews && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {loadingPastReviews && (
                        <div className="preview-note" style={{ fontSize: '12px', padding: '8px 12px' }}>
                          Loading previous review history…
                        </div>
                      )}
                      {!loadingPastReviews && pastRounds.length === 0 && (
                        <div className="preview-note" style={{ fontSize: '12px', padding: '8px 12px', background: '#f8fafc', color: '#64748b' }}>
                          No previous review rounds found.
                        </div>
                      )}
                      {!loadingPastReviews && pastRounds.map(([roundNum, roundReviews]) => (
                        <div
                          key={roundNum}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '12px',
                            backgroundColor: '#f8fafc',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontWeight: 600, fontSize: '12.5px', color: '#334155' }}>
                              Round {roundNum} (v{roundNum}.0)
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {roundReviews.length} assignment{roundReviews.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <ReviewList reviews={roundReviews} round={roundNum} isPastRound />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {publication.status === 'REVIEWING' && !publication.isPrivate && reviews.length === 0 && (
                <div className="admin-decision-card" style={{ marginBottom: '18px' }}>
                  <h4 className="admin-decision-title">Assign review team</h4>
                  <p className="admin-decision-desc">
                    Select one primary lecturer and exactly two secondary lecturers. The primary lecturer can decide the publication status.
                  </p>
                  {lecturers.length < 3 && (
                    <div className="preview-note" style={{ marginBottom: '12px', background: '#fff7ed', borderColor: '#fed7aa', color: '#9a3412' }}>
                      Live assignment requires 3 active Lecturer accounts; only {lecturers.length} are available.
                    </div>
                  )}
                  <label className="student-field__label" htmlFor="primary-reviewer" style={{ marginBottom: '6px', display: 'block' }}>Primary lecturer</label>
                  <LecturerSearchableSelect
                    lecturers={lecturers}
                    value={primaryReviewerId}
                    onChange={(id) => setPrimaryReviewerId(id)}
                    disabled={assignmentBusy}
                  />
                  <p className="student-field__label" style={{ marginTop: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Secondary lecturers</span>
                    <span style={{ fontSize: '11.5px', color: secondaryReviewerIds.length === 2 ? '#059669' : '#64748b', fontWeight: 600 }}>
                      Selected ({secondaryReviewerIds.length}/2)
                    </span>
                  </p>
                  <div className="lecturer-select-list" style={{ gap: '8px', marginBottom: '14px' }}>
                    {lecturers.filter((lecturer) => lecturer.id !== primaryReviewerId).map((lecturer) => {
                      const isSelected = secondaryReviewerIds.includes(lecturer.id);
                      return (
                        <label
                          key={lecturer.id}
                          className={`lecturer-select-item ${isSelected ? 'lecturer-select-item--active' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="lecturer-select-checkbox admin-checkbox"
                            checked={isSelected}
                            onChange={() => toggleSecondaryReviewer(lecturer.id)}
                            disabled={assignmentBusy}
                          />
                          <div className="lecturer-select-info">
                            <span className="lecturer-select-name">{lecturer.name || lecturer.email.split('@')[0]}</span>
                            <span className="lecturer-select-email">{lecturer.email}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="student-btn student-btn--secondary student-btn--sm"
                    disabled={assignmentBusy || secondaryReviewerIds.length !== 2 || !primaryReviewerId}
                    onClick={assignReviewers}
                  >
                    {assignmentBusy ? 'Assigning…' : 'Save review team'}
                  </button>
                </div>
              )}

              {!publication.isPrivate && (
                <div className="admin-decision-card" style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h4 className="admin-decision-title" style={{ margin: 0 }}>Audience visibility</h4>
                    {audiences.length === 0 && (
                      <span className="admin-audience-badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                        Default (All Auth)
                      </span>
                    )}
                  </div>
                  <p className="admin-decision-desc">
                    Admin selects multiple audiences. An empty selection defaults to all authenticated Students and Lecturers; GUEST exposes the paper on the public landing page.
                  </p>
                  <div className="admin-audience-list">
                    {([
                      {
                        key: 'GUEST',
                        title: 'Guest & Public',
                        desc: 'Public landing page, unauthenticated visitors',
                        badge: 'Public',
                        badgeClass: 'admin-audience-badge--guest',
                      },
                      {
                        key: 'STUDENT',
                        title: 'Student Audience',
                        desc: 'Visible in Student Preprints workspace',
                        badge: 'Student Portal',
                        badgeClass: 'admin-audience-badge--student',
                      },
                      {
                        key: 'LECTURER',
                        title: 'Lecturer Audience',
                        desc: 'Visible in Faculty Repository & Review Portal',
                        badge: 'Faculty Portal',
                        badgeClass: 'admin-audience-badge--lecturer',
                      },
                    ] as const).map((item) => {
                      const isSelected = audiences.includes(item.key);
                      return (
                        <label
                          key={item.key}
                          className={`admin-audience-item ${isSelected ? 'admin-audience-item--active' : ''}`}
                        >
                          <div className="admin-audience-item__left">
                            <input
                              type="checkbox"
                              className="admin-checkbox"
                              checked={isSelected}
                              onChange={() =>
                                setAudiences((current) =>
                                  current.includes(item.key)
                                    ? current.filter((audience) => audience !== item.key)
                                    : [...current, item.key]
                                )
                              }
                              disabled={visibilityBusy}
                            />
                            <div className="admin-audience-item__info">
                              <span className="admin-audience-item__title">{item.title}</span>
                              <span className="admin-audience-item__desc">{item.desc}</span>
                            </div>
                          </div>
                          <span className={`admin-audience-badge ${item.badgeClass}`}>{item.badge}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="student-btn student-btn--secondary student-btn--sm"
                    disabled={visibilityBusy}
                    onClick={saveVisibility}
                  >
                    {visibilityBusy ? 'Saving…' : 'Save audience'}
                  </button>
                </div>
              )}

              {publication.isPrivate && (
                <div className="preview-note" style={{ marginBottom: '18px', background: '#fff7ed', borderColor: '#fed7aa', color: '#9a3412' }}>
                  Private Lecturer paper: Admin has read-only access and cannot assign reviewers, change visibility, change status, publish, or delete.
                </div>
              )}

              {/* Administrator Backup Decision Card */}
              <div className="admin-decision-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 className="admin-decision-title" style={{ margin: 0 }}>Admin Backup Decision</h4>
                  <span className="manuscript-meta-pill" style={{ fontSize: '11px', padding: '2px 8px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                    Backup Authority (Quyền dự phòng)
                  </span>
                </div>
                <p className="admin-decision-desc">
                  Under SRS v0.8, the Primary Lecturer holds direct authority to decide publication status. Admin backup intervention is reserved for escalation, unresponsiveness, or administrative overrides (mandatory reason recorded in audit timeline).
                </p>
                {!publication.isPrivate && publication.status === 'REVIEWING' && (
                  <div className="admin-decision-action-group">
                    <button
                      type="button"
                      className="admin-decision-btn admin-decision-btn--publish"
                      disabled={busy}
                      onClick={() => changeStatus('PUBLISHED')}
                    >
                      <div className="admin-decision-btn__left">
                        <span className="admin-decision-btn__icon-circle admin-decision-btn__icon-circle--publish">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <div className="admin-decision-btn__text">
                          <span className="admin-decision-btn__title">Publish Manuscript</span>
                          <span className="admin-decision-btn__subtitle">Approve &amp; release to public repository</span>
                        </div>
                      </div>
                      <span className="admin-decision-btn__badge admin-decision-btn__badge--publish">
                        Approve
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </button>

                    <div className="admin-decision-sub-row">
                      <button
                        type="button"
                        className="admin-decision-btn admin-decision-btn--revision"
                        disabled={busy}
                        onClick={() => changeStatus('DRAFTING')}
                      >
                        <div className="admin-decision-btn__left">
                          <span className="admin-decision-btn__icon-circle admin-decision-btn__icon-circle--revision">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </span>
                          <div className="admin-decision-btn__text">
                            <span className="admin-decision-btn__title">Request Revision</span>
                            <span className="admin-decision-btn__subtitle">Return to student</span>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="admin-decision-btn admin-decision-btn--reject"
                        disabled={busy}
                        onClick={() => changeStatus('REJECTED')}
                      >
                        <div className="admin-decision-btn__left">
                          <span className="admin-decision-btn__icon-circle admin-decision-btn__icon-circle--reject">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </span>
                          <div className="admin-decision-btn__text">
                            <span className="admin-decision-btn__title">Reject Paper</span>
                            <span className="admin-decision-btn__subtitle">Decline submission</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                {!publication.isPrivate && publication.status === 'REJECTED' && (
                  <div className="admin-decision-action-group">
                    <button
                      type="button"
                      className="admin-decision-btn admin-decision-btn--reopen"
                      disabled={busy}
                      onClick={() => changeStatus('DRAFTING')}
                    >
                      <div className="admin-decision-btn__left">
                        <span className="admin-decision-btn__icon-circle admin-decision-btn__icon-circle--reopen">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                          </svg>
                        </span>
                        <div className="admin-decision-btn__text">
                          <span className="admin-decision-btn__title">Reopen for Revision</span>
                          <span className="admin-decision-btn__subtitle">Allow author to submit revisions</span>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
                {publication.status === 'DRAFTING' && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#d97706', fontWeight: 600 }}>
                    Manuscript is currently returned to the student for revision (DRAFTING).
                  </p>
                )}
                {publication.status === 'PUBLISHED' && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                    This manuscript is published and publicly accessible.
                  </p>
                )}
                {message && <p className="preview-note" style={{ marginTop: '14px', marginBottom: 0 }} role="status">{message}</p>}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default AdminSubmissionDetailView;
