'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { StudentShell } from '../components';
import { usePreprintDetail } from '../hooks';
import type { PreprintStatus } from '@/shared/types';

const NativePdfViewer = dynamic(
  () => import('../components/NativePdfViewer').then((mod) => mod.NativePdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="student-loading-box" style={{ padding: '60px 20px' }}>
        <div className="student-spinner" />
        <p>Loading manuscript reader…</p>
      </div>
    ),
  }
);

interface PreprintDetailViewProps {
  id: string;
}

type TabType = 'OVERVIEW' | 'PDF_VIEW' | 'REVIEWS' | 'TIMELINE';

export function PreprintDetailView({ id }: PreprintDetailViewProps) {
  const { item, loading, error } = usePreprintDetail(id);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [copiedDoi, setCopiedDoi] = useState(false);
  const [pdfExpanded, setPdfExpanded] = useState(false);

  const handleCopyDoi = () => {
    if (!item?.doi) return;
    navigator.clipboard.writeText(item.doi);
    setCopiedDoi(true);
    setTimeout(() => setCopiedDoi(false), 2000);
  };

  // Deduplicate institutions for the author byline
  const { uniqueAffiliations, authorAffiliationIndices } = useMemo(() => {
    if (!item?.authors || item.authors.length === 0) {
      return { uniqueAffiliations: [], authorAffiliationIndices: [] };
    }
    const affiliations: string[] = [];
    const indices: number[] = [];

    item.authors.forEach((author) => {
      const inst = author.institution?.trim() || 'Independent Scholar';
      let idx = affiliations.indexOf(inst);
      if (idx === -1) {
        affiliations.push(inst);
        idx = affiliations.length - 1;
      }
      indices.push(idx + 1);
    });

    return { uniqueAffiliations: affiliations, authorAffiliationIndices: indices };
  }, [item?.authors]);

  const renderStatusBadge = (status: PreprintStatus) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return (
          <span className="student-status-badge student-status-badge--approved">
            <span className="student-status-dot" />
            Approved
          </span>
        );
      case 'NEEDS_REVISION':
        return (
          <span className="student-status-badge student-status-badge--revision">
            <span className="student-status-dot" />
            Needs Revision
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="student-status-badge student-status-badge--review">
            <span className="student-status-dot" />
            Under Review
          </span>
        );
      case 'DRAFT':
        return (
          <span className="student-status-badge student-status-badge--draft">
            <span className="student-status-dot" />
            Draft
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="student-status-badge student-status-badge--withdrawn">
            <span className="student-status-dot" />
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="student-status-badge">
            <span className="student-status-dot" />
            {status}
          </span>
        );
    }
  };

  return (
    <StudentShell
      title="Manuscript Details"
      showStandardHeader={false}
    >
      {loading && (
        <div className="student-loading-box">
          <div className="student-spinner" />
          <p>Loading manuscript archive…</p>
        </div>
      )}

      {error && (
        <div className="student-error-banner">
          <strong>Unable to load manuscript:</strong> {error.message}
        </div>
      )}

      {item && (
        <div className="student-detail-wrap">
          {/* 1. Hero Article Header */}
          <section className="student-paper-hero">
            <div className="student-paper-hero__top">
              <div className="student-paper-hero__eyebrow">
                <span className="student-paper-hero__kicker">PREPRINT MANUSCRIPT</span>
                <span className="student-paper-hero__dot">•</span>
                <span className="student-paper-hero__discipline">{item.discipline || 'General Research'}</span>
              </div>
            </div>

            <h1 className="student-paper-hero__title">{item.title}</h1>

            {/* Authors Byline */}
            {item.authors && item.authors.length > 0 && (
              <div className="student-paper-hero__byline">
                <div className="student-paper-hero__authors-wrap">
                  {item.authors.map((author, index) => {
                    const affIdx = authorAffiliationIndices[index] || 1;
                    return (
                      <span key={index} className="student-paper-hero__author">
                        <span className="student-paper-hero__author-name">{author.name}</span>
                        <sup className="student-paper-hero__author-sup">{affIdx}</sup>
                        {author.isPrimary && <span className="student-author-tag student-author-tag--primary">Primary</span>}
                        {author.isCorresponding && (
                          <span className="student-author-tag student-author-tag--corr" title={`Corresponding Author: ${author.email}`}>
                            ✉
                          </span>
                        )}
                        {index < item.authors.length - 1 && <span className="student-paper-hero__sep">,</span>}
                      </span>
                    );
                  })}
                </div>

                {/* Deduplicated Affiliation Footnotes */}
                {uniqueAffiliations.length > 0 && (
                  <div className="student-paper-hero__affiliations">
                    {uniqueAffiliations.map((aff, idx) => (
                      <span key={idx} className="student-paper-hero__aff-item">
                        <sup>{idx + 1}</sup> {aff}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Metadata Strip & Quick Actions */}
            <div className="student-paper-hero__meta-row">
              <div className="student-paper-hero__badges">
                {renderStatusBadge(item.status)}
                <span className="student-version-tag">Version {item.current_version}</span>
                <span className="student-license-tag">CC BY 4.0</span>
                {item.doi && (
                  <button type="button" onClick={handleCopyDoi} className="student-doi-pill" title="Click to copy DOI">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>DOI: {item.doi}</span>
                    {copiedDoi && <span className="student-doi-copied">Copied!</span>}
                  </button>
                )}
                <span className="student-paper-hero__date">
                  Updated on {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="student-paper-hero__actions">
                {item.download_url ? (
                  <a href={item.download_url} target="_blank" rel="noreferrer" className="student-btn student-btn--primary">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download PDF</span>
                  </a>
                ) : (
                  <button type="button" className="student-btn student-btn--secondary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                    <span>PDF Processing</span>
                  </button>
                )}

                <Link href={`/student/my-preprints/${item.id}/versions`} className="student-btn student-btn--ghost">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                  <span>Versions ({item.versions?.length || 1})</span>
                </Link>

                {item.status === 'NEEDS_REVISION' && (
                  <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--warning">
                    <span>Revise Manuscript →</span>
                  </Link>
                )}

                {item.status === 'DRAFT' && (
                  <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--primary">
                    <span>Continue Draft →</span>
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* If Needs Revision: Alert Banner */}
          {item.status === 'NEEDS_REVISION' && item.reviews?.[0] && (
            <div className="student-revision-banner student-revision-banner--detail" style={{ marginBottom: '24px' }}>
              <div className="student-revision-banner__header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <strong>Faculty Revision Notice from {item.reviews[0].reviewer_name}</strong>
              </div>
              <p className="student-revision-banner__comment">
                &ldquo;{item.reviews[0].comments}&rdquo;
              </p>
              <div className="student-revision-banner__action">
                <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--warning student-btn--sm">
                  <span>Open Revision Editor →</span>
                </Link>
                <button type="button" onClick={() => setActiveTab('REVIEWS')} className="student-btn student-btn--ghost student-btn--sm">
                  View Full Feedback Checklist
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="student-detail-tabs" role="tablist">
            <button
              type="button"
              className={`student-detail-tab ${activeTab === 'OVERVIEW' ? 'student-detail-tab--active' : ''}`}
              onClick={() => setActiveTab('OVERVIEW')}
            >
              Overview &amp; Metadata
            </button>
            <button
              type="button"
              className={`student-detail-tab ${activeTab === 'PDF_VIEW' ? 'student-detail-tab--active' : ''}`}
              onClick={() => setActiveTab('PDF_VIEW')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Manuscript PDF</span>
              </span>
            </button>
            <button
              type="button"
              className={`student-detail-tab ${activeTab === 'REVIEWS' ? 'student-detail-tab--active' : ''}`}
              onClick={() => setActiveTab('REVIEWS')}
            >
              Faculty Mentorship &amp; Reviews {item.reviews?.length ? `(${item.reviews.length})` : ''}
            </button>
            <button
              type="button"
              className={`student-detail-tab ${activeTab === 'TIMELINE' ? 'student-detail-tab--active' : ''}`}
              onClick={() => setActiveTab('TIMELINE')}
            >
              Provenance &amp; Timeline
            </button>
          </div>

          {/* Tab 1: Overview & Metadata */}
          {activeTab === 'OVERVIEW' && (
            <div className="student-tab-panel" style={{ marginTop: '20px' }}>
              <div className="student-panel-grid">
                {/* Left Column: Abstract & Keywords & Document Box */}
                <div className="student-panel-main">
                  <section className="student-section-card">
                    <h3 className="student-section-card__title">Abstract</h3>
                    <p className="student-section-card__abstract">{item.abstract || 'No abstract provided.'}</p>

                    {item.keywords && item.keywords.length > 0 && (
                      <div className="student-keywords-wrap">
                        <span className="student-keywords-label">Keywords:</span>
                        {item.keywords.map((kw) => (
                          <span key={kw} className="student-keyword-pill">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                {/* Right Column: Metadata Sidebar */}
                <div className="student-panel-sidebar">
                  <div className="student-meta-card">
                    <h4 className="student-meta-card__title">Publication Details</h4>
                    <div className="student-meta-list">
                      <div className="student-meta-item">
                        <span className="student-meta-key">Status:</span>
                        <span className="student-meta-val">{renderStatusBadge(item.status)}</span>
                      </div>
                      <div className="student-meta-item">
                        <span className="student-meta-key">Current Version:</span>
                        <span className="student-meta-val">v{item.current_version}</span>
                      </div>
                      <div className="student-meta-item">
                        <span className="student-meta-key">Discipline:</span>
                        <span className="student-meta-val">{item.discipline || 'General'}</span>
                      </div>
                      {item.supervisor && (
                        <div className="student-meta-item">
                          <span className="student-meta-key">Faculty Advisor:</span>
                          <span className="student-meta-val">{item.supervisor}</span>
                        </div>
                      )}
                      <div className="student-meta-item">
                        <span className="student-meta-key">License:</span>
                        <span className="student-meta-val">Creative Commons CC BY 4.0</span>
                      </div>
                      {item.doi && (
                        <div className="student-meta-item">
                          <span className="student-meta-key">Permanent DOI:</span>
                          <span className="student-meta-val student-meta-val--code">{item.doi}</span>
                        </div>
                      )}
                      {item.sha256 && (
                        <div className="student-meta-item">
                          <span className="student-meta-key">SHA-256:</span>
                          <span className="student-meta-val student-meta-val--code" title={item.sha256}>
                            {item.sha256.substring(0, 16)}…
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Manuscript PDF Direct Reader */}
          {activeTab === 'PDF_VIEW' && (
            <div className="student-tab-panel" style={{ marginTop: '20px' }}>
              {item.download_url ? (
                <NativePdfViewer
                  url={item.download_url}
                  fileName={item.file_name || `${item.title?.substring(0, 50) || 'manuscript'}.pdf`}
                />
              ) : (
                <div className="student-empty-card" style={{ padding: '60px 20px' }}>
                  <div className="student-empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#647381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <h3>PDF Preview Not Available</h3>
                  <p>The manuscript PDF file is currently being processed or archived in cloud storage.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Faculty Mentorship & Reviews */}
          {activeTab === 'REVIEWS' && (
            <div className="student-tab-panel" style={{ marginTop: '20px' }}>
              {item.reviews && item.reviews.length > 0 ? (
                <div className="student-reviews-feed">
                  {item.reviews.map((rev) => (
                    <article key={rev.id} className="student-review-card">
                      <div className="student-review-header">
                        <div className="student-reviewer-avatar">LT</div>
                        <div className="student-reviewer-info">
                          <div className="student-reviewer-name-row">
                            <strong>{rev.reviewer_name}</strong>
                            <span className="student-reviewer-badge">{rev.reviewer_title}</span>
                          </div>
                          <span className="student-review-date">
                            Review decision logged on {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="student-review-decision">
                          {rev.decision === 'APPROVED' ? (
                            <span className="student-decision-badge student-decision-badge--approved">
                              Approved for Publication
                            </span>
                          ) : (
                            <span className="student-decision-badge student-decision-badge--revision">
                              Revision Requested
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="student-review-body">
                        <h4 className="student-review-subheading">Faculty Comments &amp; Assessment</h4>
                        <p className="student-review-text">&ldquo;{rev.comments}&rdquo;</p>

                        {rev.recommendations && rev.recommendations.length > 0 && (
                          <div className="student-review-recommendations">
                            <h4 className="student-review-subheading">Actionable Revisions Required:</h4>
                            <ul className="student-review-checklist">
                              {rev.recommendations.map((rec, i) => (
                                <li key={i} className="student-review-checklist-item">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                  </svg>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {rev.decision === 'NEEDS_REVISION' && (
                        <div className="student-review-footer-action">
                          <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--warning">
                            <span>Open Revision Form (Upload Revised Draft) →</span>
                          </Link>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="student-empty-card">
                  <div className="student-empty-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <h3>Under Faculty Evaluation</h3>
                  <p>
                    Your manuscript is currently queued for mentorship review. Our faculty advisors typically return structured comments and evaluation within 48 hours.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Provenance & Timeline */}
          {activeTab === 'TIMELINE' && (
            <div className="student-tab-panel" style={{ marginTop: '20px' }}>
              <div className="student-timeline-card">
                <h3 className="student-timeline-title">Audit Trail &amp; Provenance Record</h3>
                <p className="student-timeline-desc">
                  Every submission, review event, and version change is cryptographically tracked in this immutable ledger.
                </p>

                <div className="student-timeline-list">
                  {item.timeline && item.timeline.length > 0 ? (
                    item.timeline.map((event, idx) => (
                      <div key={event.id || idx} className="student-timeline-item">
                        <div className="student-timeline-indicator">
                          <div className="student-timeline-dot" />
                          {idx < (item.timeline?.length || 1) - 1 && <div className="student-timeline-line" />}
                        </div>
                        <div className="student-timeline-content">
                          <div className="student-timeline-meta">
                            <span className="student-timeline-timestamp">
                              {new Date(event.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="student-timeline-actor">by {event.actor}</span>
                          </div>
                          <h4 className="student-timeline-heading">{event.title}</h4>
                          <p className="student-timeline-text">{event.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="student-muted">No timeline events recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </StudentShell>
  );
}

export default PreprintDetailView;
