'use client';

import { useState } from 'react';

type ShowcaseTab = 'all' | 'in_review' | 'approved';

interface ShowcaseManuscript {
  id: string;
  title: string;
  authors: string;
  discipline: string;
  version: string;
  status: string;
  statusType: 'blue' | 'gold' | 'green';
  updatedAt: string;
  doi: string;
}

const showcaseManuscripts: ShowcaseManuscript[] = [
  {
    id: 'm1',
    title: 'Climate Signals & Sea Level Projections in Coastal Urban Corridors',
    authors: 'L. M. Tuan, Dr. Tran T. H. • Dept. of Civil & Environmental',
    discipline: 'Applied Sciences',
    version: 'v2.1',
    status: 'Faculty Review',
    statusType: 'blue',
    updatedAt: 'Updated 2h ago',
    doi: '10.5281/rp.2026.0118',
  },
  {
    id: 'm2',
    title: 'Self-Supervised Feature Representation for Dense Tropical Forestry',
    authors: 'Nguyen Van A, Pham Hoang K. • Faculty of Computer Science',
    discipline: 'AI & Data Systems',
    version: 'v1.0',
    status: 'Editorial Check',
    statusType: 'gold',
    updatedAt: 'Updated yesterday',
    doi: '10.5281/rp.2026.0102',
  },
  {
    id: 'm3',
    title: 'Microplastic Bioaccumulation Dynamics in Mekong Estuarine Ecology',
    authors: 'Dang Thao M., Dr. Sarah J. • Institute of Biotechnology',
    discipline: 'Biotechnology',
    version: 'v3.0',
    status: 'Ready to Publish',
    statusType: 'green',
    updatedAt: 'Approved',
    doi: '10.5281/rp.2026.0089',
  },
];

export function PaperPortalShowcase() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('all');

  const filteredManuscripts = showcaseManuscripts.filter((item) => {
    if (activeTab === 'in_review') return item.statusType === 'blue' || item.statusType === 'gold';
    if (activeTab === 'approved') return item.statusType === 'green';
    return true;
  });

  return (
    <div className="paper-showcase-wrap">
      <div className="paper-showcase-glow" aria-hidden="true" />

      {/* Main Workspace Frame */}
      <div className="paper-portal-window paper-reveal">
        {/* Mock OS / Portal Top Bar */}
        <div className="paper-portal-topbar">
          <strong>
            <span>RP</span>
            ResearchPulse Workspace
          </strong>
          <div className="paper-portal-nav-pills" role="tablist" aria-label="Portal views">
            <button
              type="button"
              className={`paper-portal-tab-btn ${activeTab === 'all' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Preprints
            </button>
            <button
              type="button"
              className={`paper-portal-tab-btn ${activeTab === 'in_review' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('in_review')}
            >
              In Review (2)
            </button>
            <button
              type="button"
              className={`paper-portal-tab-btn ${activeTab === 'approved' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              Approved (1)
            </button>
          </div>
          <div className="paper-portal-top-user">
            <span className="paper-portal-badge-live">● Live Sync</span>
            <i title="Author">NM</i>
          </div>
        </div>

        {/* Portal Body with Mini Sidebar & Main Content */}
        <div className="paper-portal-body">
          <aside className="paper-portal-sidebar">
            <small>WORKSPACE</small>
            <a href="#portal" className="is-active">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              Overview
            </a>
            <a href="#portal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              My Preprints
            </a>
            <a href="#portal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Review Notes
            </a>
            <a href="#portal">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
              Versions
            </a>

            <div className="paper-sidebar-profile">
              <i>NM</i>
              <span>
                Nguyen Minh
                <small>Graduate Researcher</small>
              </span>
            </div>
          </aside>

          <section className="paper-portal-content">
            <div className="paper-portal-heading">
              <div>
                <small>ACADEMIC REPOSITORY RECORD • VERIFIED</small>
                <h3>Manuscript Review &amp; Versioning Tracker</h3>
              </div>
              <a href="/api/auth/login?next=/student/my-preprints" className="paper-portal-view-all">
                Open Workspace <span>→</span>
              </a>
            </div>

            {/* Manuscript Cards List */}
            <div className="paper-manuscript-list">
              {filteredManuscripts.map((m) => (
                <div className="paper-manuscript-card" key={m.id}>
                  <div className={`paper-manuscript-icon ${m.statusType}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>

                  <div className="paper-manuscript-copy">
                    <div className="paper-manuscript-header-row">
                      <strong title={m.title}>{m.title}</strong>
                      <span className="paper-version-pill">{m.version}</span>
                    </div>
                    <small>
                      {m.authors} • <span className="paper-doi-text">{m.doi}</span>
                    </small>
                    <em>
                      <b className={`paper-status-dot ${m.statusType}`} />
                      <span className="paper-status-label">{m.status}</span>
                      <span className="paper-meta-sep">•</span>
                      <span className="paper-updated-text">{m.updatedAt}</span>
                    </em>
                  </div>

                  <div className="paper-manuscript-actions">
                    <span className="paper-card-badge-field">{m.discipline}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Micro Activity & Stats Panels */}
            <div className="paper-portal-bottom-grid">
              <div className="paper-mini-panel">
                <div className="paper-mini-panel-header">
                  <strong>Citation &amp; Read Signals</strong>
                  <small>Past 30 days</small>
                </div>
                {/* Crisp SVG Sparkline */}
                <div className="paper-chart-svg-wrap">
                  <svg viewBox="0 0 320 80" className="paper-sparkline" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0071bc" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#0071bc" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 65 Q 40 50, 80 55 T 160 38 T 240 22 T 320 12 L 320 80 L 0 80 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M0 65 Q 40 50, 80 55 T 160 38 T 240 22 T 320 12"
                      fill="none"
                      stroke="#0071bc"
                      strokeWidth="2.5"
                    />
                    <circle cx="320" cy="12" r="4" fill="#0071bc" />
                  </svg>
                  <div className="paper-chart-stats-row">
                    <span><strong>1,842</strong> Reads</span>
                    <span><strong>124</strong> Timestamp citations</span>
                    <span className="paper-stat-growth">+38% vs last month</span>
                  </div>
                </div>
              </div>

              <div className="paper-mini-panel">
                <div className="paper-mini-panel-header">
                  <strong>Review Status</strong>
                  <small>Audit pipeline</small>
                </div>
                <div className="paper-donut-wrap">
                  <div className="paper-donut">
                    <b>100%</b>
                    <small>traceable</small>
                  </div>
                  <div className="paper-donut-legend">
                    <div><span className="dot-blue" /> In Faculty Review</div>
                    <div><span className="dot-gold" /> Revision Needed</div>
                    <div><span className="dot-green" /> Approved Preprint</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Floating Interactive Micro-Cards */}
      <div className="paper-floating-card paper-activity-card">
        <div className="paper-floating-icon-bubble">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <div className="paper-floating-copy">
          <strong>New Faculty Critique Added</strong>
          <small>Dr. Linh Tran commented on v2.1 Methodology</small>
        </div>
        <span className="paper-floating-time">2m ago</span>
      </div>

      <div className="paper-floating-card paper-milestone-card">
        <div className="paper-floating-shield-bubble">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <div className="paper-floating-copy">
          <strong>SHA-256 Timestamp Sealed</strong>
          <small>Immutable priority hash registered to record</small>
        </div>
        <span className="paper-milestone-badge">Verified</span>
      </div>
    </div>
  );
}
