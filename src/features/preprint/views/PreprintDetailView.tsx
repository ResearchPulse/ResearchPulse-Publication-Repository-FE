'use client';

import Link from 'next/link';
import { ApiPendingState, StudentShell } from '../components';
import { usePreprintDetail } from '../hooks';

export function PreprintDetailView({ id }: { id: string }) {
  const { item, loading, error, apiPending } = usePreprintDetail(id);
  return <StudentShell title="Preprint detail">
    {loading && <p className="student-muted">Loading manuscript…</p>}
    {apiPending && <ApiPendingState />}
    {error && !apiPending && <p className="student-error">{error.message}</p>}
    {item && <article className="student-detail"><span className="student-kicker">{item.status} · Version {item.current_version}</span><h2>{item.title}</h2><p>{item.abstract || 'No abstract provided.'}</p><div className="student-detail-actions"><Link href={'/student/my-preprints/' + id + '/edit'}>Edit draft</Link><Link href={'/student/my-preprints/' + id + '/versions'}>Version history</Link></div></article>}
  </StudentShell>;
}

export default PreprintDetailView;
