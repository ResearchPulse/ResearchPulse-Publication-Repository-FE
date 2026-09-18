'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StudentShell } from '../components';
import { studentPreprintApi } from '../api';
import type { StudentPreprint, PreprintVersionInfo } from '../types';

interface PreprintVersionsViewProps {
  id: string;
}

export function PreprintVersionsView({ id }: PreprintVersionsViewProps) {
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

  return (
    <StudentShell
      title={item ? `Version History: ${item.title}` : 'Version History'}
      kicker="Manuscript Lineage & Provenance"
      breadcrumbs={[
        { label: 'Preprint Portal', href: '/' },
        { label: 'My Manuscripts', href: '/student/my-preprints' },
        { label: item ? item.title.substring(0, 24) + '…' : 'Details', href: `/student/my-preprints/${id}` },
        { label: 'Versions' },
      ]}
      actions={
        item && (
          <div className="student-detail-top-actions">
            {(item.status === 'NEEDS_REVISION' || item.status === 'DRAFT') && (
              <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--warning">
                <span>Submit New Version →</span>
              </Link>
            )}
            <Link href={`/student/my-preprints/${item.id}`} className="student-btn student-btn--secondary">
              <span>Back to Manuscript</span>
            </Link>
          </div>
        )
      }
    >
      {loading && (
        <div className="student-loading-box">
          <div className="student-spinner" />
          <p>Loading version history ledger…</p>
        </div>
      )}

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
    </StudentShell>
  );
}

export default PreprintVersionsView;
