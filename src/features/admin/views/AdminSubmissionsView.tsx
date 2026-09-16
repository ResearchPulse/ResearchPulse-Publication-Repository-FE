'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button, Panel, SelectInput, StatusBadge, TextInput } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import type { PreprintStatus } from '@/shared/types';
import { ROUTES } from '@/app/router';

const previewRows: Array<{
  id: string;
  title: string;
  author: string;
  status: PreprintStatus;
  version: number;
  updated: string;
}> = [
  { id: 'preview-001', title: 'Mapping data literacy in undergraduate research', author: 'Nguyễn Minh An', status: 'SUBMITTED', version: 1, updated: 'Waiting for API' },
  { id: 'preview-002', title: 'A reproducible workflow for lab notebooks', author: 'Trần Gia Huy', status: 'NEEDS_REVISION', version: 2, updated: 'Waiting for API' },
  { id: 'preview-003', title: 'Open methods for small research teams', author: 'Lê Hà My', status: 'APPROVED', version: 3, updated: 'Waiting for API' },
];

export function AdminSubmissionsView() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');

  const rows = useMemo(
    () =>
      previewRows.filter(
        (row) =>
          `${row.title} ${row.author}`.toLowerCase().includes(query.toLowerCase()) &&
          (status === 'ALL' || row.status === status)
      ),
    [query, status]
  );

  return (
    <AdminShell active="submissions" title="Submissions">
      <AdminPageHeader
        eyebrow="Editorial queue"
        title="Submissions"
        description="Review the work entering Hyperlabdata, one version at a time."
      />
      <div className="preview-note">
        Preview rows are illustrative. Live submission data will load from <code>/api/v1/admin/preprints</code>.
      </div>
      <Panel className="table-shell">
        <div className="table-toolbar">
          <TextInput
            className="search-input"
            aria-label="Search submissions"
            placeholder="Search title or author"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <SelectInput
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="NEEDS_REVISION">Needs revision</option>
            <option value="APPROVED">Approved</option>
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
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="title-cell">
                    <strong>{row.title}</strong>
                    <span>{row.author}</span>
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>v{row.version}</td>
                  <td>{row.updated}</td>
                  <td>
                    <Link href={ROUTES.ADMIN.SUBMISSION_DETAIL(row.id)}>
                      <Button variant="ghost">Open</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}

export default AdminSubmissionsView;
