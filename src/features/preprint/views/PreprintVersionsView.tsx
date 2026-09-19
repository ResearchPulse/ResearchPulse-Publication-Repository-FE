'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StudentShell } from '../components';
import { LecturerShell } from '@/features/lecturer/components';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { studentPreprintApi } from '../api';
import type { StudentPreprint, PreprintVersionInfo } from '../types';
import { TimelineSkeleton } from '@/components/skeleton';

interface PreprintVersionsViewProps {
  id: string;
}

function PreprintVersionsShell({
  isLecturer,
  title,
  actions,
  children,
}: {
  isLecturer: boolean;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return isLecturer ? (
    <LecturerShell active="submissions" title={title}>
      {actions && <div style={{ marginBottom: '20px' }}>{actions}</div>}
      {children}
    </LecturerShell>
  ) : (
    <StudentShell
      title={title}
      kicker="Manuscript Lineage & Provenance"
      actions={actions}
    >
      {children}
    </StudentShell>
  );
}

export function PreprintVersionsView({ id }: PreprintVersionsViewProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLecturer = user?.role === 'LECTURER' || (pathname?.startsWith('/lecturer/') ?? false);
  const workspacePath = isLecturer ? '/lecturer/submissions' : '/student/my-preprints';
  const editPath = isLecturer ? `${workspacePath}/new?id=${id}` : `${workspacePath}/${id}/edit`;
  const detailPath = `${workspacePath}/${id}`;

  const [item, setItem] = useState<StudentPreprint | null>(null);
  const [versions, setVersions] = useState<PreprintVersionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    studentPreprintApi.get(id)
      .then((res) => {
        if (!active) return;
        setItem(res);
        setVersions(res.versions || []);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err : new Error('Unable to load version history.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const pageTitle = item ? `Version History: ${item.title}` : 'Version History';

  return (
    <PreprintVersionsShell
      isLecturer={isLecturer}
      title={pageTitle}
      actions={
        item && (
          <div className="student-detail-top-actions">
            {(item.status === 'NEEDS_REVISION' || item.status === 'DRAFT') && (
              <Link href={editPath} className="student-btn student-btn--warning">
                <span>Submit New Version →</span>
              </Link>
            )}
            <Link href={detailPath} className="student-btn student-btn--secondary">
              <span>Back to Manuscript</span>
            </Link>
          </div>
        )
      }
    >
      {loading && <TimelineSkeleton count={3} />}

      {error && (
        <div className="student-error-banner">
          <strong>Error loading versions:</strong> {error.message}
        </div>
      )}

      {!loading && !error && (
        <div className="student-versions-container">
          <div className="student-versions-header-box">
            <h3>Permanent Version Archive</h3>
            <p>
              Preprints cannot be erased once released. Every revision remains permanently accessible with its cryptographic timestamp, file artifact, and author response notes.
            </p>
          </div>

          <div className="student-versions-timeline">
            {versions.map((ver, index) => {
              const isLatest = index === 0;

              return (
                <div key={ver.version} className={`student-version-card ${isLatest ? 'student-version-card--latest' : ''}`}>
                  <div className="student-version-badge-col">
                    <div className="student-version-pill">
                      {ver.version_label}
                    </div>
                    {isLatest && <span className="student-latest-tag">Current</span>}
                  </div>

                  <div className="student-version-main">
                    <div className="student-version-header-row">
                      <div className="student-version-title-group">
                        <strong className="student-version-title">Version {ver.version} Release</strong>
                        <span className="student-version-date">
                          Timestamped on {new Date(ver.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <span className={`student-status-badge student-status-badge--${ver.status.toLowerCase().replace('_', '-')}`}>
                        {ver.status}
                      </span>
                    </div>

                    {ver.change_summary && (
                      <div className="student-version-summary-box">
                        <span className="student-version-summary-label">Change Summary:</span>
                        <p className="student-version-summary-text">{ver.change_summary}</p>
                      </div>
                    )}

                    <div className="student-version-file-box">
                      <div className="student-version-file-left">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="student-file-name">{ver.file_name}</span>
                        <span className="student-file-size">({ver.file_size})</span>
                      </div>

                      {ver.sha256 && (
                        <div className="student-version-hash">
                          <span>SHA-256:</span>
                          <code>{ver.sha256.substring(0, 16)}…</code>
                        </div>
                      )}

                      {ver.download_url ? (
                        <a
                          href={ver.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="student-action-link student-action-link--primary"
                        >
                          Download PDF
                        </a>
                      ) : (
                        <span className="student-action-link">PDF unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PreprintVersionsShell>
  );
}

export default PreprintVersionsView;
