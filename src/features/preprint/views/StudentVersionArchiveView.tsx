'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentDashboardLayout } from '../components';
import { usePreprintList } from '../hooks';

export function StudentVersionArchiveView() {
  const { items } = usePreprintList();
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [collapsedManuscripts, setCollapsedManuscripts] = useState<Record<string, boolean>>({});

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

  const filteredManuscripts = selectedManuscriptId === 'ALL'
    ? items
    : items.filter((item) => item.id === selectedManuscriptId);

  return (
    <StudentDashboardLayout
      title="Version Archive"
      revisionCount={items.filter((i) => i.status === 'NEEDS_REVISION').length}
      totalCount={items.length}
    >
      {/* Page Header */}
      <div className="dashboard-page-header">
        <div className="dashboard-page-header__left">
          <span className="dashboard-hero__eyebrow">IMMUTABLE REVISION LEDGER</span>
          <h1 className="dashboard-hero__title" style={{ fontSize: '24px', margin: '0 0 6px' }}>
            Permanent Version Archive &amp; Provenance
          </h1>
          <p className="dashboard-hero__subtitle" style={{ margin: 0 }}>
            Every released version is permanently preserved with a cryptographic SHA-256 timestamp and author change notes.
          </p>
        </div>
        <div className="dashboard-page-header__right">
          <Link href="/student/my-preprints/new" className="dashboard-btn dashboard-btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Submission</span>
          </Link>
        </div>
      </div>

      {/* Manuscript Filter Selector */}
      <div className="dashboard-card" style={{ marginBottom: '24px' }}>
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">Select Manuscript to Inspect Lineage</h2>
          <div className="dashboard-card__filters" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`dashboard-filter-btn ${selectedManuscriptId === 'ALL' ? 'dashboard-filter-btn--active' : ''}`}
              onClick={() => setSelectedManuscriptId('ALL')}
            >
              All Manuscripts ({items.length})
            </button>
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`dashboard-filter-btn ${selectedManuscriptId === m.id ? 'dashboard-filter-btn--active' : ''}`}
                onClick={() => setSelectedManuscriptId(m.id)}
                title={m.title}
              >
                {m.title.length > 25 ? `${m.title.substring(0, 25)}…` : m.title}
              </button>
            ))}
          </div>
        </div>

        {/* Version Lineages List */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filteredManuscripts.map((manuscript) => {
            const isExpanded = !collapsedManuscripts[manuscript.id];

            return (
              <div key={manuscript.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="dashboard-badge-tag">{manuscript.discipline || 'General'}</span>
                    <h3 style={{ margin: '6px 0 2px', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                      <Link href={`/student/my-preprints/${manuscript.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {manuscript.title}
                      </Link>
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      DOI: {manuscript.doi || '10.5281/zenodo.hdl-preview'} &bull; {manuscript.versions?.length || 1} archived version(s)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link
                      href={`/student/my-preprints/${manuscript.id}`}
                      className="dashboard-table__action-btn"
                      style={{ fontSize: '13px' }}
                    >
                      View Full Manuscript →
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleManuscript(manuscript.id)}
                      className="dashboard-table__action-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        cursor: 'pointer',
                        color: '#0f172a',
                        borderRadius: '6px',
                      }}
                      title={isExpanded ? 'Thu gọn' : 'Xổ xuống'}
                      aria-label="Toggle versions"
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
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Version Cards */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {manuscript.versions && manuscript.versions.length > 0 ? (
                      manuscript.versions.map((ver, idx) => (
                        <div
                          key={ver.version}
                          className="student-version-card"
                          style={{
                            background: idx === 0 ? '#f0f9ff' : '#ffffff',
                            border: idx === 0 ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '18px 22px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '18px',
                          }}
                        >
                          <div
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '10px',
                              background: idx === 0 ? '#0071bc' : '#f1f5f9',
                              color: idx === 0 ? '#ffffff' : '#475569',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '15px',
                              flexShrink: 0,
                            }}
                          >
                            <span>v{ver.version}</span>
                            {idx === 0 && <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }}>Latest</span>}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                              <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                                Version {ver.version_label || `v${ver.version}`} Release
                              </strong>
                              <span
                                className={`user-badge ${
                                  ver.status === 'APPROVED'
                                    ? 'user-badge--approved'
                                    : ver.status === 'NEEDS_REVISION'
                                    ? 'user-badge--revision'
                                    : 'user-badge--draft'
                                }`}
                              >
                                {ver.status}
                              </span>
                            </div>

                            <p style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#475569', lineHeight: 1.5 }}>
                              <strong>Change Summary:</strong> {ver.change_summary || 'Initial draft version submitted for evaluation.'}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '12px', color: '#64748b' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <span>📄 {ver.file_name} ({ver.file_size || '2.4 MB'})</span>
                                {ver.sha256 && (
                                  <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                                    SHA: {ver.sha256.substring(0, 16)}…
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {ver.sha256 && (
                                  <button
                                    type="button"
                                    className="dashboard-table__cite-btn"
                                    onClick={() => handleCopyHash(ver.sha256!)}
                                  >
                                    {copiedHash === ver.sha256 ? 'Hash Copied!' : 'Copy Checksum'}
                                  </button>
                                )}
                                <a
                                  href={`/downloads/${ver.file_name}`}
                                  download
                                  className="dashboard-table__cite-btn"
                                  style={{ color: '#0071bc', borderColor: '#b8dcef' }}
                                >
                                  Download PDF
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                        Version 1.0 recorded on {manuscript.submitted_at ? new Date(manuscript.submitted_at).toLocaleDateString() : 'August 28, 2026'}.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export default StudentVersionArchiveView;
