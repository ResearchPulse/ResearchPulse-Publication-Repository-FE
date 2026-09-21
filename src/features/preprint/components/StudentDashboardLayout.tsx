'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { StudentTopbar } from './StudentTopbar';
import { usePreprintList } from '../hooks';

interface StudentDashboardLayoutProps {
  title?: string;
  children: ReactNode;
  revisionCount?: number;
  totalCount?: number;
}

export function StudentDashboardLayout({
  title,
  children,
  revisionCount,
  totalCount,
}: StudentDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { items } = usePreprintList();

  const effectiveTotalCount = useMemo(() => {
    if (totalCount !== undefined) return totalCount;
    return items.length;
  }, [totalCount, items]);

  const effectiveRevisionCount = useMemo(() => {
    if (revisionCount !== undefined) return revisionCount;
    return items.filter((i) => i.status === 'NEEDS_REVISION').length;
  }, [revisionCount, items]);

  return (
    <div className="student-dashboard-layout">
      {/* Persistent Left Sidebar */}
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        revisionCount={effectiveRevisionCount}
        totalCount={effectiveTotalCount}
      />

      {/* Main Workspace Frame */}
      <div className="student-dashboard-main">
        {/* Sticky Top Header */}
        <StudentTopbar
          title={title}
          revisionCount={effectiveRevisionCount}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Scrollable Dashboard Body */}
        <main className="student-dashboard-body" id="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboardLayout;
