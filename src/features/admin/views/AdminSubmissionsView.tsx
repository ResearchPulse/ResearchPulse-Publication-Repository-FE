'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Panel, SelectInput, StatusBadge, TextInput } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { adminApi, type AdminPublication, type AdminPublicationStatus } from '../api';
import type { PreprintStatus } from '@/shared/types';
import { ROUTES } from '@/app/router';

type StatusFilter = 'ALL' | AdminPublicationStatus;

function badgeStatus(status: AdminPublicationStatus): PreprintStatus {
  switch (status) {
    case 'REVIEWING':
      return 'UNDER_REVIEW';
    case 'PUBLISHED':
      return 'PUBLISHED';
    case 'REJECTED':
      return 'REJECTED';
    case 'PROCESSING':
    case 'DRAFTING':
    default:
      return 'DRAFT';
  }
}

function displayTitle(item: AdminPublication) {
  return item.title?.trim() || 'Untitled manuscript';
}

export function AdminSubmissionsView() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Awaited<ReturnType<typeof adminApi.listSubmissions>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    adminApi.listSubmissions({
      page,
      limit: 20,
      search: query.trim() || undefined,
      status: status === 'ALL' ? undefined : status,
    })
      .then((next) => {
        if (active) setResult(next);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load submissions.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, query, status]);

  const pagination = result?.pagination;

  return (
    <AdminShell active="submissions" title="Submissions">
      <AdminPageHeader
        eyebrow="Editorial queue"
        title="Submissions"
        description="Review the work entering Hyperlabdata, one version at a time."
      />
      <div className="preview-note" role={error ? 'alert' : 'status'}>
        {loading ? 'Loading submissions from the Preprint Backend...' : error || 'Live submission data.'}
      </div>
      <Panel className="table-shell">
        <div className="table-toolbar">
          <TextInput
            className="search-input"
            aria-label="Search submissions"
            placeholder="Search title or keyword"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <SelectInput
            aria-label="Filter by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(1);
            }}
          >
            <option value="ALL">All statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="DRAFTING">Drafting</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </SelectInput>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Submission</th>
                <th>Status</th>
                <th>Version</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {result?.items.map((item) => (
                <tr key={item.id}>
                  <td className="title-cell">
                    <strong>{displayTitle(item)}</strong>
                    <span>{item.uploader?.name || item.uploader?.email || 'Student author unavailable'}</span>
                  </td>
                  <td>
                    <StatusBadge status={badgeStatus(item.status)} />
                  </td>
                  <td>{item.currentVersion?.versionLabel || '—'}</td>
                  <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={ROUTES.ADMIN.SUBMISSION_DETAIL(item.id)}>
                      <Button variant="ghost">Open</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && !error && !result?.items.length && (
                <tr>
                  <td colSpan={5}>No submissions match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="table-toolbar" aria-label="Submission pagination">
            <span>Page {pagination.page} of {pagination.totalPages} · {pagination.total} total</span>
            <div className="review-actions">
              <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>
                Previous
              </Button>
              <Button variant="secondary" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </AdminShell>
  );
}

export default AdminSubmissionsView;
