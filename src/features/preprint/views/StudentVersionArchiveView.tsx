'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { StudentShell } from '../components';
import { usePreprintList } from '../hooks';
import { studentPreprintApi } from '../api';
import type { PreprintVersionInfo } from '../types';

export function StudentVersionArchiveView() {
  const { items, loading: listLoading } = usePreprintList();
  const [versionsByPublication, setVersionsByPublication] = useState<Record<string, PreprintVersionInfo[]>>({});
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [collapsedManuscripts, setCollapsedManuscripts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (listLoading || items.length === 0) {
      setVersionsByPublication({});
      return;
    }

    let active = true;
    setVersionsLoading(true);
    setVersionsError(null);
    void Promise.allSettled(items.map(async (item) => [item.id, await studentPreprintApi.versions(item.id)] as const))
      .then((results) => {
        if (!active) return;
        const entries = results
          .filter((result): result is PromiseFulfilledResult<readonly [string, PreprintVersionInfo[]]> => result.status === 'fulfilled')
          .map((result) => result.value);
        setVersionsByPublication(Object.fromEntries(entries));
        if (results.some((result) => result.status === 'rejected')) {
          setVersionsError('Some version histories could not be loaded. Open the manuscript to retry.');
        }
      })
      .finally(() => {
        if (active) setVersionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [items, listLoading]);

  const toggleManuscript = (id: string) => {
    setCollapsedManuscripts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const manuscriptsWithVersions = useMemo(() => {
    return items.map((item) => ({
      ...item,
      versions: versionsByPublication[item.id] || [],
    }));
  }, [items, versionsByPublication]);

  const filteredManuscripts = useMemo(() => {
    let list = selectedManuscriptId === 'ALL'
      ? manuscriptsWithVersions
      : manuscriptsWithVersions.filter((item) => item.id === selectedManuscriptId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.discipline?.toLowerCase().includes(q) ||
          m.doi?.toLowerCase().includes(q) ||
          m.versions?.some(
            (v) =>
              v.sha256?.toLowerCase().includes(q) ||
              v.change_summary?.toLowerCase().includes(q) ||
              v.file_name?.toLowerCase().includes(q),
          ),
      );
    }
    return list;
  }, [manuscriptsWithVersions, selectedManuscriptId, searchQuery]);

  const isAllCollapsed = useMemo(() => {
    if (filteredManuscripts.length === 0) return false;
    return filteredManuscripts.every((m) => collapsedManuscripts[m.id]);
  }, [filteredManuscripts, collapsedManuscripts]);

  const toggleAllCollapse = () => {
    if (isAllCollapsed) {
      setCollapsedManuscripts({});
    } else {
      const all: Record<string, boolean> = {};
      filteredManuscripts.forEach((m) => {
        all[m.id] = true;
      });
      setCollapsedManuscripts(all);
    }
  };

  return (
    <StudentShell title="Version Archive" showStandardHeader={false}>
      {/* 1. Filter & Search Toolbar (Synced identically with My Manuscripts) */}
      <div className="student-filter-toolbar">
        {/* Left: Dropdown select manuscript */}
        <div className="student-sort-box" style={{ gap: '8px' }}>
          <span className="student-sort-label" style={{ fontWeight: 600, color: '#475569' }}>
            Manuscript:
          </span>
          <select
            value={selectedManuscriptId}
            onChange={(e) => setSelectedManuscriptId(e.target.value)}
            className="student-sort-select"
            style={{ maxWidth: '340px' }}
            aria-label="Filter versions by manuscript"
          >
            <option value="ALL">All Manuscripts ({items.length})</option>
            {items.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title || 'Untitled Manuscript'}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Search Input & Toggle All Button */}
        <div className="student-toolbar-actions">
          <div className="student-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search title, DOI, SHA-256..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="student-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="student-search-clear">
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            className="student-btn student-btn--secondary archive-toggle-all-btn"
            onClick={toggleAllCollapse}
            aria-label={isAllCollapsed ? 'Expand all manuscript versions' : 'Collapse all manuscript versions'}
          >
            <span>{isAllCollapsed ? 'Expand All' : 'Collapse All'}</span>
          </button>
        </div>
      </div>

      {/* 2. Version Lineages Content Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {(listLoading || versionsLoading) && (
          <div className="student-loading-box">
            <div className="student-spinner" />
            <p>Loading cryptographic version archives and provenance…</p>
          </div>
        )}

        {versionsError && (
          <div className="student-error" role="alert">
            {versionsError}
          </div>
        )}

        {!listLoading && !versionsLoading && filteredManuscripts.length === 0 && (
          <div className="student-empty-card">
            <div className="student-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>
              {searchQuery ? 'No matching version archives found' : 'No manuscript archives yet'}
            </h3>
            <p>
              {searchQuery
                ? `No version history matches "${searchQuery}". Try searching by manuscript title, DOI, or SHA-256 hash.`
                : 'You have not submitted any preprints yet. Submit your first manuscript to establish cryptographic version timestamps and permanent provenance.'}
            </p>
            <div className="student-empty-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/student/my-preprints" className="student-btn student-btn--secondary">
                View My Manuscripts
              </Link>
              <Link href="/student/my-preprints/new" className="student-btn student-btn--primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Start New Submission</span>
              </Link>
            </div>
          </div>
        )}

        {!listLoading && !versionsLoading && filteredManuscripts.map((manuscript) => {
          const isExpanded = !collapsedManuscripts[manuscript.id];

          return (
            <article key={manuscript.id} className="archive-manuscript-card">
              {/* Manuscript Header */}
              <div className="archive-manuscript-header">
                <div className="archive-manuscript-meta">
                  <div>
                    <span className="dashboard-badge-tag">{manuscript.discipline || 'General'}</span>
                  </div>
                  <h3 className="archive-manuscript-title">
                    <Link href={`/student/my-preprints/${manuscript.id}`}>
                      {manuscript.title}
                    </Link>
                  </h3>
                  <div className="archive-manuscript-subinfo">
                    <span>
                      <strong>DOI:</strong> {manuscript.doi || 'DOI Pending / Not Assigned'}
                    </span>
                    <span>&bull;</span>
                    <span>
                      {manuscript.versions?.length || 0} permanent version(s) recorded
                    </span>
                  </div>
                </div>

                <div className="archive-manuscript-actions">
                  <Link
                    href={`/student/my-preprints/${manuscript.id}`}
                    className="student-btn student-btn--secondary student-btn--sm"
                  >
                    View Details →
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleManuscript(manuscript.id)}
                    className={`archive-toggle-btn ${isExpanded ? 'archive-toggle-btn--expanded' : ''}`}
                    title={isExpanded ? 'Collapse versions' : 'Expand versions'}
                    aria-label="Toggle versions list"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Version Lineage Timeline */}
              {isExpanded && (
                <div className="archive-timeline-container">
                  {manuscript.versions && manuscript.versions.length > 0 ? (
                    manuscript.versions.map((ver, idx) => {
                      const isLatest = idx === 0;

                      return (
                        <div
                          key={ver.version}
                          className={`archive-version-item ${isLatest ? 'archive-version-item--latest' : ''}`}
                        >
                          {/* Version Badge Node */}
                          <div className={`archive-version-badge ${isLatest ? 'archive-version-badge--latest' : ''}`}>
                            <span>v{ver.version}</span>
                            {isLatest && <span className="archive-version-badge__sub">Latest</span>}
                          </div>

                          {/* Version Info & Provenance */}
                          <div className="archive-version-content">
                            <div className="archive-version-header">
                              <div>
                                <strong className="archive-version-title">
                                  Version {ver.version_label || `v${ver.version}`} Release
                                </strong>
                                {ver.created_at && (
                                  <span className="archive-version-date">
                                    &bull; Archived on {new Date(ver.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`user-badge ${
                                  ver.status === 'APPROVED'
                                    ? 'user-badge--approved'
                                    : ver.status === 'NEEDS_REVISION'
                                    ? 'user-badge--revision'
                                    : ver.status === 'UNDER_REVIEW'
                                    ? 'user-badge--review'
                                    : 'user-badge--draft'
                                }`}
                              >
                                {ver.status}
                              </span>
                            </div>

                            <p className="archive-change-summary">
                              <strong>Change Summary:</strong> {ver.change_summary || 'Initial camera-ready version submitted for archive.'}
                            </p>

                            {/* Cryptographic Provenance Bar */}
                            <div className="archive-provenance-bar">
                              <div className="archive-provenance-info">
                                <span className="archive-file-tag">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                  {ver.file_name} ({ver.file_size || 'Size unavailable'})
                                </span>
                                {ver.sha256 && (
                                  <span className="archive-sha-tag" title={ver.sha256}>
                                    SHA-256: {ver.sha256.substring(0, 10)}…{ver.sha256.substring(ver.sha256.length - 6)}
                                  </span>
                                )}
                              </div>

                              <div className="archive-actions-group">
                                {ver.sha256 && (
                                  <button
                                    type="button"
                                    className={`archive-cite-btn ${copiedHash === ver.sha256 ? 'archive-cite-btn--copied' : ''}`}
                                    onClick={() => handleCopyHash(ver.sha256!)}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      {copiedHash === ver.sha256 ? (
                                        <polyline points="20 6 9 17 4 12" />
                                      ) : (
                                        <>
                                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </>
                                      )}
                                    </svg>
                                    <span>{copiedHash === ver.sha256 ? 'Hash Copied!' : 'Copy Checksum'}</span>
                                  </button>
                                )}
                                {ver.download_url && (
                                  <a
                                    href={ver.download_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="student-btn student-btn--secondary"
                                    style={{ fontSize: '12px', padding: '5px 10px', gap: '5px' }}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                      <polyline points="7 10 12 15 17 10" />
                                      <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    <span>Download PDF</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>
                      No version history is recorded for this manuscript yet.
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </StudentShell>
  );
}

export default StudentVersionArchiveView;
