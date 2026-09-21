'use client';

import { useState, type ReactNode } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { StudentTopbar } from './StudentTopbar';

interface StudentDashboardLayoutProps {
  title?: string;
  children: ReactNode;
  revisionCount?: number;
  totalCount?: number;
}

export function StudentDashboardLayout({
  title,
  children,
  revisionCount = 0,
  totalCount = 0,
}: StudentDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="student-dashboard-layout">
      {/* Persistent Left Sidebar */}
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        revisionCount={revisionCount}
        totalCount={totalCount}
      />

      {/* Main Workspace Frame */}
      <div className="student-dashboard-main">
        {/* Sticky Top Header */}
        <StudentTopbar
          title={title}
          revisionCount={revisionCount}
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
