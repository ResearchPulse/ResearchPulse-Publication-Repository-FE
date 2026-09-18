'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentShell } from '../components';
import { usePreprintDetail } from '../hooks';
import type { PreprintStatus } from '@/shared/types';

interface PreprintDetailViewProps {
  id: string;
}

type TabType = 'OVERVIEW' | 'DOCUMENT' | 'REVIEWS' | 'TIMELINE';

export function PreprintDetailView({ id }: PreprintDetailViewProps) {
  const { item, loading, error } = usePreprintDetail(id);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [copiedDoi, setCopiedDoi] = useState(false);

  const handleCopyDoi = () => {
    if (!item?.doi) return;
    navigator.clipboard.writeText(item.doi);
    setCopiedDoi(true);
    setTimeout(() => setCopiedDoi(false), 2000);
  };

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
      title={item ? item.title : 'Manuscript Record'}
      kicker={item?.discipline ? `${item.discipline} • Manuscript Record` : 'Manuscript Record'}
      breadcrumbs={[
        { label: 'Preprint Portal', href: '/' },
        { label: 'My Manuscripts', href: '/student/my-preprints' },
        { label: item ? `v${item.current_version}` : 'Details' },
      ]}
      actions={
        item && (
          <div className="student-detail-top-actions">
            {item.status === 'NEEDS_REVISION' && (
              <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--warning">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Revise Manuscript</span>
              </Link>
            )}

            {item.status === 'DRAFT' && !item.revision_required && (
              <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--primary">
                <span>Continue Draft →</span>
              </Link>
            )}

            {item.status === 'DRAFT' && item.revision_required && (
              <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--warning">
                <span>Submit Revision →</span>
              </Link>
            )}

            <Link href={`/student/my-preprints/${item.id}/versions`} className="student-btn student-btn--secondary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>Versions ({item.versions?.length || 1})</span>
            </Link>
          </div>
        )
      }
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
          {/* Metadata Bar */}
          <div className="student-detail-meta-bar">
            <div className="student-detail-badges">
              {renderStatusBadge(item.status)}
              <span className="student-version-tag">Version {item.current_version}</span>
              {item.discipline && <span className="student-discipline-tag">{item.discipline}</span>}
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
            </div>

            <div className="student-detail-timestamp">
              <span>Updated on {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* If Needs Revision: Alert Banner */}
          {item.status === 'NEEDS_REVISION' && item.reviews?.[0] && (
            <div className="student-revision-banner student-revision-banner--detail">
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
              className={`student-detail-tab ${activeTab === 'DOCUMENT' ? 'student-detail-tab--active' : ''}`}
              onClick={() => setActiveTab('DOCUMENT')}
            >
              Manuscript Document
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
            <div className="student-tab-panel">
              <div className="student-panel-grid">
                {/* Left Column: Abstract & Keywords */}
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

                  {/* Authors List */}
                  <section className="student-section-card">
                    <h3 className="student-section-card__title">Contributing Authors</h3>
                    <div className="student-authors-table">
                      {item.authors?.map((author, index) => (
                        <div key={index} className="student-authors-table-row">
                          <div className="student-author-avatar student-author-avatar--sm">
                            {author.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="student-author-cell-info">
                            <div className="student-author-cell-name">
                              <strong>{author.name}</strong>
                              {author.isPrimary && <span className="student-author-pill">Primary</span>}
                              {author.isCorresponding && <span className="student-author-pill student-author-pill--co">Corresponding</span>}
                            </div>
                            <span className="student-author-cell-meta">{author.email} • {author.institution}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
                        <span className="student-meta-val">{item.discipline || 'Unassigned'}</span>
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
                    </div>
                  </div>

                  {/* Actions Box */}
                  <div className="student-meta-card">
                    <h4 className="student-meta-card__title">Author Actions</h4>
                    <div className="student-actions-column">
                      {item.status === 'NEEDS_REVISION' && (
                        <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--warning student-btn--block">
                          Submit Revision
                        </Link>
                      )}
                      {item.status === 'DRAFT' && !item.revision_required && (
                        <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--primary student-btn--block">
                          Edit Manuscript Draft
                        </Link>
                      )}
                      {item.status === 'DRAFT' && item.revision_required && (
                        <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--warning student-btn--block">
                          Submit Revision
                        </Link>
                      )}
                      <button type="button" onClick={() => setActiveTab('DOCUMENT')} className="student-btn student-btn--secondary student-btn--block">
                        Download PDF File
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Manuscript Document */}
          {activeTab === 'DOCUMENT' && (
            <div className="student-tab-panel">
              <div className="student-document-card">
                <div className="student-document-header">
                  <div className="student-document-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div className="student-document-info">
                    <h3>{item.file_name || `${item.title.substring(0, 30)}.pdf`}</h3>
                    <div className="student-document-meta">
                      <span>{item.file_size || 'Size unavailable'}</span>
                      <span className="student-separator">•</span>
                      <span>PDF Document</span>
                      <span className="student-separator">•</span>
                      <span className="student-hash-verified">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        SHA-256 Timestamp Verified
                      </span>
                    </div>
                  </div>
                  <div className="student-document-action">
                    {item.download_url ? (
                    <a href={item.download_url} target="_blank" rel="noreferrer" className="student-btn student-btn--primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Download PDF</span>
                    </a>
                    ) : (
                      <button type="button" className="student-btn student-btn--secondary" disabled>
                        PDF unavailable
                      </button>
                    )}
                  </div>
                </div>

                <div className="student-document-hash-box">
                  <div className="student-hash-key">Cryptographic SHA-256 Checksum:</div>
                  {item.sha256 ? (
                    <code className="student-hash-code">{item.sha256}</code>
                  ) : (
                    <p className="student-hash-note">No checksum is available in the publication API response.</p>
                  )}
                  <p className="student-hash-note">
                    The checksum is shown only when it is returned by the publication service.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Tab 3: Faculty Mentorship & Reviews */}
          {activeTab === 'REVIEWS' && (
            <div className="student-tab-panel">
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
            <div className="student-tab-panel">
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
