'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useTranslation, LanguageSwitcher } from '@/i18n';

interface StudentTopbarProps {
  onToggleSidebar?: () => void;
  title?: string;
  revisionCount?: number;
}

export function StudentTopbar({
  onToggleSidebar,
  title,
  revisionCount = 0,
}: StudentTopbarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentTitle = title || t('student.topbar.myPreprintsTitle');

  const getBreadcrumbGroup = () => {
    if (pathname.startsWith('/student/mentor-feedback')) {
      return t('student.topbar.reviewGroup');
    }
    if (pathname.startsWith('/student/account')) {
      return t('student.topbar.personalGroup');
    }
    return t('student.topbar.preprintsGroup');
  };

  const breadcrumbGroup = getBreadcrumbGroup();

  useEffect(() => {
    if (!showNotifications) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications]);

  return (
    <header className="student-topbar">
      <div className="student-topbar__left">
        {onToggleSidebar && (
          <button type="button" className="student-topbar__menu-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar Navigation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        <div className="student-topbar__breadcrumbs">
          <span className="student-topbar__crumb-root">{breadcrumbGroup}</span>
          <span className="student-topbar__crumb-sep">/</span>
          <span className="student-topbar__crumb-current">{currentTitle}</span>
        </div>
      </div>

      <div className="student-topbar__right">
        <div className="student-topbar__search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder={t('common.search')} className="student-topbar__search-input" aria-label={t('common.search')} />
        </div>

        <div className="student-topbar__notif-wrapper" ref={notifRef}>
          <button
            type="button"
            className="student-topbar__notif-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`${t('common.notifications')} (${revisionCount})`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {revisionCount > 0 && <span className="student-topbar__notif-dot" />}
          </button>

          {showNotifications && (
            <div className="student-topbar__notif-popover">
              <div className="student-topbar__notif-header">
                <strong>{t('common.notifications')}</strong>
                <span className="student-topbar__notif-count">{revisionCount}</span>
              </div>
              <div className="student-topbar__notif-list">
                {revisionCount > 0 ? (
                  <Link href="/student/mentor-feedback" className="student-topbar__notif-item" onClick={() => setShowNotifications(false)}>
                    <div className="student-topbar__notif-item-icon student-topbar__notif-item-icon--amber">!</div>
                    <div className="student-topbar__notif-item-text">
                      <p className="student-topbar__notif-item-title">Có phản hồi mới từ người phản biện</p>
                      <p className="student-topbar__notif-item-desc">Mở mục Phản hồi của GVHD để xem nhận xét mới nhất.</p>
                    </div>
                  </Link>
                ) : (
                  <div className="student-topbar__notif-empty">
                    <p>{t('common.noNotifications')}</p>
                  </div>
                )}
              </div>
              <div className="student-topbar__notif-footer">
                <Link href="/student/mentor-feedback" onClick={() => setShowNotifications(false)}>Xem phản hồi của GVHD →</Link>
              </div>
            </div>
          )}
        </div>

        <Link href="/student/my-preprints/new" className="student-topbar__cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{t('student.topbar.newPreprintButton')}</span>
        </Link>
      </div>
    </header>
  );
}

export default StudentTopbar;
