'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentDashboardLayout } from '../components';
import { usePreprintList } from '../hooks';

export function StudentMentorFeedbackView() {
  const { items } = usePreprintList();
  const [filter, setFilter] = useState<'ALL' | 'ACTION' | 'REVIEW'>('ALL');

  // Collect all reviews across manuscripts
  const revisionItems = items.filter((i) => i.status === 'NEEDS_REVISION');
  const reviewItems = items.filter((i) => i.status === 'UNDER_REVIEW');

  return (
    <StudentDashboardLayout
      title="Mentor Feedback & Reviews"
      revisionCount={revisionItems.length}
      totalCount={items.length}
    >
      {/* Page Header */}
      <div className="dashboard-page-header">
        <div className="dashboard-page-header__left">
          <span className="dashboard-hero__eyebrow">ACADEMIC PEER MENTORSHIP</span>
          <h1 className="dashboard-hero__title" style={{ fontSize: '24px', margin: '0 0 6px' }}>
            Faculty Mentor Feedback &amp; Reviews
          </h1>
          <p className="dashboard-hero__subtitle" style={{ margin: 0 }}>
            Track evaluations from advisory faculty, revision checklists, and approval sign-offs.
          </p>
        </div>
        <div className="dashboard-page-header__right">
          <Link href="/student/my-preprints" className="dashboard-btn dashboard-btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>My Manuscripts</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="dashboard-metric-card dashboard-metric-card--alert">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Action Required</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{revisionItems.length}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--amber">
            <span>Revisions requested by reviewer</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">In Scope Evaluation</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--sky">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{reviewItems.length}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--sky">
            <span>Advisory review queue active</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Assigned Mentors</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">2</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--neutral">
            <span>Senior faculty advisory board</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="dashboard-card" style={{ marginBottom: '24px' }}>
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">Mentor Feedback Stream</h2>
          <div className="dashboard-card__filters">
            <button
              type="button"
              className={`dashboard-filter-btn ${filter === 'ALL' ? 'dashboard-filter-btn--active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All Evaluations
            </button>
            <button
              type="button"
              className={`dashboard-filter-btn ${filter === 'ACTION' ? 'dashboard-filter-btn--active' : ''}`}
              onClick={() => setFilter('ACTION')}
            >
              Action Required ({revisionItems.length})
            </button>
            <button
              type="button"
              className={`dashboard-filter-btn ${filter === 'REVIEW' ? 'dashboard-filter-btn--active' : ''}`}
              onClick={() => setFilter('REVIEW')}
            >
              In Scope Review ({reviewItems.length})
            </button>
          </div>
        </div>

        {/* Feedback Cards List */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Item 1: Mapping data literacy */}
          {(filter === 'ALL' || filter === 'ACTION') && (
            <div className="dashboard-alert-banner" style={{ display: 'block', padding: '22px 24px', background: '#ffffff', border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="dashboard-mentor-avatar" style={{ background: '#0071bc', color: '#ffffff', width: '38px', height: '38px', fontSize: '13px' }}>
                    LT
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>Dr. Linh Tran</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Advisory Board Chair &bull; Sep 14, 2026</span>
                  </div>
                </div>
                <span className="user-badge user-badge--revision" style={{ padding: '4px 12px', fontSize: '12px' }}>
                  NEEDS REVISION
                </span>
              </div>

              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>MANUSCRIPT</span>
                <h3 style={{ margin: '3px 0 0', fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
                  <Link href="/student/my-preprints/manuscript-stem-01" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Mapping data literacy in undergraduate research (v2)
                  </Link>
                </h3>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Reviewer Critique:</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6, fontStyle: 'italic', background: '#fffdf5', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #d97706' }}>
                  &ldquo;Please update Figure 4 confidence intervals and provide the raw dataset repository link before final approval. Methodological rigor in Section 3.2 looks significantly improved over v1.0.&rdquo;
                </p>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Required Revision Items:</strong>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Add dataset repository link to camera-ready footer</li>
                  <li>Export all figures at 300 DPI for conference printing</li>
                  <li>Address two-way ANOVA confidence interval table</li>
                </ul>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <Link
                  href="/student/my-preprints/manuscript-stem-01/edit"
                  className="dashboard-btn dashboard-btn--primary"
                  style={{ background: '#d97706' }}
                >
                  Open Revision Editor →
                </Link>
                <Link
                  href="/student/my-preprints/manuscript-stem-01"
                  className="dashboard-filter-btn"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  View Manuscript Overview
                </Link>
                <Link
                  href="/student/my-preprints/manuscript-stem-01/versions"
                  className="dashboard-filter-btn"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Version Lineage
                </Link>
              </div>
            </div>
          )}

          {/* Item 2: Collaborative peer review */}
          {(filter === 'ALL' || filter === 'REVIEW') && (
            <div className="dashboard-alert-banner" style={{ display: 'block', padding: '22px 24px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="dashboard-mentor-avatar" style={{ background: '#7c3aed', color: '#ffffff', width: '38px', height: '38px', fontSize: '13px' }}>
                    NT
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>Assoc. Prof. Nguyen Van Thuan</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Faculty Scope Reviewer &bull; Sep 15, 2026</span>
                  </div>
                </div>
                <span className="user-badge user-badge--review" style={{ padding: '4px 12px', fontSize: '12px' }}>
                  UNDER REVIEW
                </span>
              </div>

              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>MANUSCRIPT</span>
                <h3 style={{ margin: '3px 0 0', fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
                  <Link href="/student/my-preprints/manuscript-peerreview-03" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Collaborative peer review practices in student academic journals (v1)
                  </Link>
                </h3>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Reviewer Status:</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6, background: '#f0f9ff', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #0284c7' }}>
                  Manuscript has passed initial editorial triage and is currently being evaluated under the double-blind rubric evaluation protocol. Expected completion by Sep 22, 2026.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <Link
                  href="/student/my-preprints/manuscript-peerreview-03"
                  className="dashboard-btn dashboard-btn--primary"
                >
                  View Manuscript &amp; Timeline →
                </Link>
              </div>
            </div>
          )}

          {/* Item 3: Open methods */}
          {(filter === 'ALL' || filter === 'REVIEW') && (
            <div className="dashboard-alert-banner" style={{ display: 'block', padding: '22px 24px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="dashboard-mentor-avatar" style={{ background: '#0071bc', color: '#ffffff', width: '38px', height: '38px', fontSize: '13px' }}>
                    LT
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>Dr. Linh Tran</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Assigned Advisor &bull; Sep 03, 2026</span>
                  </div>
                </div>
                <span className="user-badge user-badge--review" style={{ padding: '4px 12px', fontSize: '12px' }}>
                  UNDER REVIEW
                </span>
              </div>

              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>MANUSCRIPT</span>
                <h3 style={{ margin: '3px 0 0', fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
                  <Link href="/student/my-preprints/manuscript-workflow-02" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Open methods for small research teams (v1)
                  </Link>
                </h3>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Reviewer Status:</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #94a3b8' }}>
                  Assigned for methodological reproducibility check. Mentorship queue position #2.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <Link
                  href="/student/my-preprints/manuscript-workflow-02"
                  className="dashboard-btn dashboard-btn--primary"
                >
                  View Manuscript Details →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export default StudentMentorFeedbackView;
