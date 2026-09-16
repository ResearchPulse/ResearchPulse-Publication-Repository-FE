'use client';

import Link from 'next/link';
import { Button } from '@hyperdata/design-system';
import { ApiPendingState, StudentShell } from '../components';
import { usePreprintList } from '../hooks';

export function PreprintListView() {
  const { items, loading, error, apiPending } = usePreprintList();
  return <StudentShell title="My preprints">
    <div className="student-actions"><Link href="/student/my-preprints/new"><Button variant="primary">Start a preprint</Button></Link></div>
    {loading && <p className="student-muted">Loading your manuscripts…</p>}
    {apiPending && <ApiPendingState />}
    {error && !apiPending && <p className="student-error">{error.message}</p>}
    {!loading && !error && !items.length && <div className="student-empty"><strong>No preprints yet.</strong><span>Your manuscripts will appear here after the Public BE API is available.</span></div>}
    {!!items.length && <div className="student-list">{items.map((item) => <Link className="student-record" href={'/student/my-preprints/' + item.id} key={item.id}><div><strong>{item.title}</strong><span>Version {item.current_version} · {item.status}</span></div><span>→</span></Link>)}</div>}
  </StudentShell>;
}

export default PreprintListView;
