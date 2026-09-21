'use client';

import { useEffect, useRef, useState } from 'react';
import { HyperdataLogo } from './hyperdata-logo';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 440;

export function PublicPortalShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(CANVAS_HEIGHT);

  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        if (availableWidth >= 900) {
          const newScale = availableWidth < CANVAS_WIDTH ? availableWidth / CANVAS_WIDTH : 1;
          setScale(newScale);

          if (showcaseRef.current) {
            const naturalHeight = showcaseRef.current.offsetHeight || CANVAS_HEIGHT;
            setHeight(Math.round(naturalHeight * newScale));
          }
        }
      }
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <>
      {/* Desktop & Tablet Mockup (>= 900px) */}
      <div
        ref={containerRef}
        className="pl-showcase-scaler-container pl-showcase--desktop"
        style={{
          width: '100%',
          height: `${height}px`,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <div
          ref={showcaseRef}
          className="pl-showcase-wrapper"
          style={{
            width: `${CANVAS_WIDTH}px`,
            minWidth: `${CANVAS_WIDTH}px`,
            maxWidth: `${CANVAS_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            position: 'absolute',
            top: 0,
            left: '50%',
            marginLeft: `-${CANVAS_WIDTH / 2}px`,
          }}
        >
        {/* Soft Ambient Background Glow */}
        <div className="pl-showcase-glow" aria-hidden="true" />

        {/* Floating Card: Left (Research Trends & Activity) */}
        <div className="pl-floating-card pl-floating-card--left" aria-hidden="true">
          <div className="pl-floating-card__title">Hoạt động nghiên cứu</div>
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
            <span className="pl-trend-meta">Tốc độ nộp bài của sinh viên</span>
          </div>
        </div>

        {/* Main Dashboard Window */}
        <div className="pl-showcase-window">
          {/* App Topbar */}
          <div className="pl-app-topbar">
            <div className="pl-app-topbar__left">
              <HyperdataLogo size={22} showText={true} />
              <span className="pl-app-divider">/</span>
              <span className="pl-app-location">Cổng Bản Thảo Học Thuật</span>
            </div>

            <div className="pl-app-topbar__search">
              <span className="pl-search-placeholder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Tìm kiếm bản thảo, tác giả, đề tài...</span>
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
              <div className="pl-app-avatar" />
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
                <span>Không gian</span>
              </div>
              <div className="pl-app-nav-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Bản thảo của tôi</span>
              </div>
              <div className="pl-app-nav-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Góp ý bình duyệt</span>
              </div>
              <div className="pl-app-nav-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Lịch sử sửa đổi</span>
              </div>
            </aside>

            {/* Feed Panel */}
            <main className="pl-app-feed">
              <div className="pl-feed-head">
                <div className="pl-feed-head__title">Bản thảo đang bình duyệt gần đây</div>
                <span className="pl-feed-head__link">Xem tất cả 14 bản thảo →</span>
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
                      Phân tích dữ liệu học máy trong mạng nơ-ron tích chập
                    </div>
                    <div className="pl-feed-card__meta">
                      Nguyễn Văn An • Phiên bản 2.0 • Khoa học Máy tính
                    </div>
                  </div>
                  <div className="pl-feed-card__badge pl-badge--approved">
                    Đã duyệt
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
                      Quy trình kiểm thử tự động với môi trường Cloud-native
                    </div>
                    <div className="pl-feed-card__meta">
                      Trần Gia Huy • Phiên bản 1.2 • Kỹ thuật Phần mềm
                    </div>
                  </div>
                  <div className="pl-feed-card__badge pl-badge--review">
                    Đang phản biện
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
                      Thiết kế hệ thống đề xuất sản phẩm thời gian thực
                    </div>
                    <div className="pl-feed-card__meta">
                      Lê Hà My • Phiên bản 1.0 • Hệ thống thông tin
                    </div>
                  </div>
                  <div className="pl-feed-card__badge pl-badge--revision">
                    Yêu cầu sửa đổi
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Floating Card: Right Top (Editorial Review Breakdown) */}
        <div className="pl-floating-card pl-floating-card--right-top" aria-hidden="true">
          <div className="pl-floating-card__title">Thống kê bình duyệt</div>
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
                <span>Đã phê duyệt (62%)</span>
              </div>
              <div className="pl-legend-item">
                <span className="pl-legend-dot pl-legend-dot--green" />
                <span>Đang phản biện (24%)</span>
              </div>
              <div className="pl-legend-item">
                <span className="pl-legend-dot pl-legend-dot--slate" />
                <span>Đang sửa đổi (14%)</span>
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
              <div className="pl-impact-title">Từ bản thảo đến công trình học thuật</div>
              <div className="pl-impact-text">Giảng viên bảo chứng • Sẵn sàng xuất bản</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile-Native Showcase Redesign (< 900px) */}
    <div className="pl-mobile-showcase-container pl-showcase--mobile">
      <div className="pl-mobile-showcase-window">
        {/* Soft Ambient Background Glow */}
        <div className="pl-showcase-glow" aria-hidden="true" />

        {/* Topbar */}
        <div className="pl-mobile-showcase-topbar">
          <div className="pl-mobile-showcase-brand">
            <HyperdataLogo size={20} showText={true} />
            <span className="pl-app-divider">/</span>
            <span className="pl-mobile-app-sub">Cổng Bản Thảo</span>
          </div>
          <div className="pl-app-topbar__right">
            <div className="pl-app-bell" aria-label="Notifications">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="pl-app-dot" />
            </div>
            <div className="pl-app-avatar" style={{ width: 26, height: 26, fontSize: 11 }}>HD</div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pl-mobile-showcase-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Tìm kiếm bản thảo, tác giả, đề tài...</span>
        </div>

        {/* Mobile Quick Stats Row */}
        <div className="pl-mobile-showcase-stats">
          <div className="pl-mobile-stat-card">
            <div className="pl-mobile-stat-value text-green">↑ +142%</div>
            <div className="pl-mobile-stat-label">Tốc độ nộp bài</div>
          </div>
          <div className="pl-mobile-stat-card">
            <div className="pl-mobile-stat-value text-blue">62%</div>
            <div className="pl-mobile-stat-label">Đã phê duyệt</div>
          </div>
          <div className="pl-mobile-stat-card">
            <div className="pl-mobile-stat-value text-indigo">100%</div>
            <div className="pl-mobile-stat-label">Bảo chứng học viện</div>
          </div>
        </div>

        {/* Live Recent Manuscripts Feed */}
        <div className="pl-mobile-showcase-feed">
          <div className="pl-feed-head">
            <div className="pl-feed-head__title">Bản thảo đang bình duyệt</div>
            <span className="pl-feed-head__link">Xem tất cả 14 →</span>
          </div>

          <div className="pl-mobile-feed-list">
            {/* Paper 1 */}
            <div className="pl-mobile-feed-card">
              <div className="pl-feed-card__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="pl-feed-card__content">
                <div className="pl-mobile-feed-title">Phân tích dữ liệu học máy trong mạng nơ-ron tích chập</div>
                <div className="pl-mobile-feed-meta">Nguyễn Văn An • Khoa học Máy tính</div>
              </div>
              <span className="pl-feed-card__badge pl-badge--approved">Đã duyệt</span>
            </div>

            {/* Paper 2 */}
            <div className="pl-mobile-feed-card">
              <div className="pl-feed-card__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="pl-feed-card__content">
                <div className="pl-mobile-feed-title">Quy trình kiểm thử tự động với môi trường Cloud-native</div>
                <div className="pl-mobile-feed-meta">Trần Gia Huy • Kỹ thuật Phần mềm</div>
              </div>
              <span className="pl-feed-card__badge pl-badge--review">Đang phản biện</span>
            </div>

            {/* Paper 3 */}
            <div className="pl-mobile-feed-card">
              <div className="pl-feed-card__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="pl-feed-card__content">
                <div className="pl-mobile-feed-title">Thiết kế hệ thống đề xuất sản phẩm thời gian thực</div>
                <div className="pl-mobile-feed-meta">Lê Hà My • Hệ thống thông tin</div>
              </div>
              <span className="pl-feed-card__badge pl-badge--revision">Yêu cầu sửa đổi</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Highlight Banner */}
        <div className="pl-mobile-showcase-impact">
          <div className="pl-impact-icon" style={{ width: 28, height: 28 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="9" y1="18" x2="15" y2="18" />
              <line x1="10" y1="22" x2="14" y2="22" />
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
            </svg>
          </div>
          <div>
            <div className="pl-impact-title" style={{ fontSize: 12.5 }}>Từ bản thảo đến công trình học thuật</div>
            <div className="pl-impact-text" style={{ fontSize: 11 }}>Giảng viên bảo chứng • Sẵn sàng xuất bản chính thức</div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}
