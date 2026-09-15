import { HyperdataLogo } from './hyperdata-logo';

export function PublicPortalShowcase() {
  return (
    <div className="pl-showcase-wrapper">
      {/* Soft Ambient Background Glow */}
      <div className="pl-showcase-glow" aria-hidden="true" />

      {/* Floating Card: Left (Research Trends & Activity) */}
      <div className="pl-floating-card pl-floating-card--left" aria-hidden="true">
        <div className="pl-floating-card__title">Research activity</div>
        <div className="pl-trend-chart">
          <svg viewBox="0 0 160 50" fill="none" className="pl-trend-svg">
            <path
              d="M 5 42 Q 35 38, 55 28 T 105 18 T 155 8"
              stroke="#0071bc"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 5 42 Q 35 38, 55 28 T 105 18 T 155 8 L 155 48 L 5 48 Z"
              fill="url(#trend-gradient)"
              opacity="0.18"
            />
            <defs>
              <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0071bc" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="155" cy="8" r="4" fill="#0071bc" />
          </svg>
        </div>
        <div className="pl-trend-stat">
          <span className="pl-trend-badge">↑ +142%</span>
          <span className="pl-trend-meta">Student preprint velocity</span>
        </div>
      </div>

      {/* Main Dashboard Window */}
      <div className="pl-showcase-window">
        {/* App Topbar */}
        <div className="pl-app-topbar">
          <div className="pl-app-topbar__left">
            <HyperdataLogo size={22} showText={true} />
            <span className="pl-app-divider">/</span>
            <span className="pl-app-location">Preprint Portal</span>
          </div>

          <div className="pl-app-topbar__search">
            <span className="pl-search-placeholder">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search manuscripts, authors, topics...</span>
            </span>
          </div>

          <div className="pl-app-topbar__right">
            <div className="pl-app-bell" aria-label="Notifications">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="pl-app-dot" />
            </div>
            <div className="pl-app-avatar" aria-label="User profile">A</div>
          </div>
        </div>

        {/* App Workspace Body */}
        <div className="pl-app-body">
          {/* Mini Sidebar */}
          <aside className="pl-app-sidebar">
            <div className="pl-app-nav-item pl-app-nav-item--active">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Workspace</span>
            </div>
            <div className="pl-app-nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>My Manuscripts</span>
            </div>
            <div className="pl-app-nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Review Notes</span>
            </div>
            <div className="pl-app-nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Versions</span>
            </div>
          </aside>

          {/* Feed Panel */}
          <main className="pl-app-feed">
            <div className="pl-feed-head">
              <div className="pl-feed-head__title">Recent Manuscripts in Review</div>
              <span className="pl-feed-head__link">See all 14 manuscripts →</span>
            </div>

            <div className="pl-feed-list">
              {/* Manuscript 1 */}
              <div className="pl-feed-card">
                <div className="pl-feed-card__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="pl-feed-card__content">
                  <div className="pl-feed-card__title">
                    Mapping data literacy in undergraduate STEM research
                  </div>
                  <div className="pl-feed-card__meta">
                    Nguyen Minh An • Version 2.0 • Computer Science
                  </div>
                </div>
                <div className="pl-feed-card__badge pl-badge--approved">
                  Approved
                </div>
              </div>

              {/* Manuscript 2 */}
              <div className="pl-feed-card">
                <div className="pl-feed-card__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="pl-feed-card__content">
                  <div className="pl-feed-card__title">
                    A reproducible workflow framework for laboratory notebooks
                  </div>
                  <div className="pl-feed-card__meta">
                    Tran Gia Huy • Version 1.2 • Open Methods
                  </div>
                </div>
                <div className="pl-feed-card__badge pl-badge--review">
                  Under Review
                </div>
              </div>

              {/* Manuscript 3 */}
              <div className="pl-feed-card">
                <div className="pl-feed-card__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="pl-feed-card__content">
                  <div className="pl-feed-card__title">
                    Collaborative peer review practices in student academic journals
                  </div>
                  <div className="pl-feed-card__meta">
                    Le Ha My • Version 1.0 • Research Integrity
                  </div>
                </div>
                <div className="pl-feed-card__badge pl-badge--revision">
                  Revision Requested
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Card: Right Top (Editorial Review Breakdown) */}
      <div className="pl-floating-card pl-floating-card--right-top" aria-hidden="true">
        <div className="pl-floating-card__title">Editorial breakdown</div>
        <div className="pl-donut-widget">
          {/* Donut Chart SVG */}
          <svg viewBox="0 0 42 42" className="pl-donut-svg">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#eaf5fb" strokeWidth="4.5" />
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#0071bc"
              strokeWidth="4.5"
              strokeDasharray="62 38"
              strokeDashoffset="25"
            />
            <circle
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke="#15803d"
              strokeWidth="4.5"
              strokeDasharray="24 76"
              strokeDashoffset="63"
            />
          </svg>
          <div className="pl-donut-legend">
            <div className="pl-legend-item">
              <span className="pl-legend-dot pl-legend-dot--blue" />
              <span>Approved (62%)</span>
            </div>
            <div className="pl-legend-item">
              <span className="pl-legend-dot pl-legend-dot--green" />
              <span>Under review (24%)</span>
            </div>
            <div className="pl-legend-item">
              <span className="pl-legend-dot pl-legend-dot--slate" />
              <span>In revision (14%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Card: Right Bottom (Turn Information into Impact) */}
      <div className="pl-floating-card pl-floating-card--right-bottom" aria-hidden="true">
        <div className="pl-impact-box">
          <div className="pl-impact-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="9" y1="18" x2="15" y2="18" />
              <line x1="10" y1="22" x2="14" y2="22" />
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
            </svg>
          </div>
          <div>
            <div className="pl-impact-title">From manuscript to milestone</div>
            <div className="pl-impact-text">Faculty verified • Publication ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}
