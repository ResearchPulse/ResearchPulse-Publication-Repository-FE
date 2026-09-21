'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/i18n';
import { NotificationBell } from '@/shared/components/NotificationBell';

interface StudentTopbarProps {
  onToggleSidebar?: () => void;
  title?: string;
  revisionCount?: number;
}

function StudentTopbarSearch() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || searchParams?.get('q') || '');

  // 1. Sync from URL
  useEffect(() => {
    const q = searchParams?.get('search') || searchParams?.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  // 2. Bi-directional sync: listen to search changes from list tables
  useEffect(() => {
    const handleSearchChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (typeof customEvent.detail === 'string') {
        setSearchQuery(customEvent.detail);
      }
    };
    window.addEventListener('student-search-change', handleSearchChange);
    return () => window.removeEventListener('student-search-change', handleSearchChange);
  }, []);

  const isListView = pathname.startsWith('/student/my-preprints') || pathname.startsWith('/student/published');

  const onInputChange = (val: string) => {
    setSearchQuery(val);

    if (isListView) {
      // Realtime live filter: broadcast to table immediately
      window.dispatchEvent(new CustomEvent('student-search-change', { detail: val }));

      // Update URL silently without whole page reload
      const target = pathname.startsWith('/student/published') ? '/student/published' : '/student/my-preprints';
      const newUrl = val.trim() ? `${target}?search=${encodeURIComponent(val.trim())}` : target;
      window.history.replaceState(null, '', newUrl);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    const target = pathname.startsWith('/student/published') ? '/student/published' : '/student/my-preprints';
    if (trimmed) {
      router.push(`${target}?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(target);
    }
  };

  const handleClear = () => {
    onInputChange('');
    if (!isListView) {
      router.push('/student/my-preprints');
    }
  };

  return (
    <form className="student-topbar__search" onSubmit={handleSearch} role="search">
      <button
        type="submit"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          color: 'inherit',
        }}
        aria-label={t('common.search')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
      <input
        type="text"
        placeholder={t('common.search')}
        value={searchQuery}
        onChange={(e) => onInputChange(e.target.value)}
        className="student-topbar__search-input"
        aria-label={t('common.search')}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            fontSize: '15px',
            padding: '0 4px',
            lineHeight: 1,
          }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </form>
  );
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
        <Suspense fallback={
          <div className="student-topbar__search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder={t('common.search')} className="student-topbar__search-input" disabled />
          </div>
        }>
          <StudentTopbarSearch />
        </Suspense>

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
