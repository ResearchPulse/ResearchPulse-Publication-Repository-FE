'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { NotificationBell } from '@/shared/components/NotificationBell';

interface StudentTopbarProps {
  onToggleSidebar?: () => void;
  title?: string;
  revisionCount?: number;
}

export function StudentTopbar({
  onToggleSidebar,
  title,
}: StudentTopbarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

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

        <NotificationBell />

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
