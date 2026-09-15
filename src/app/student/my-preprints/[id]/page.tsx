'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { Button, Panel, StatusBadge } from '@hyperdata/design-system';
import { UserShell } from '../../../../components/user-shell';
import { preprintApi } from '../../../../lib/student-preprint-api';
import type { Preprint } from '../../../../lib/student-types';

export default function PreprintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<Preprint | null>(null);
  const [live, setLive] = useState(false);
  useEffect(() => { preprintApi.get(id).then((result) => { setItem(result); setLive(true); }).catch(() => undefined); }, [id]);
  const title = item?.title ?? 'Mapping data literacy in undergraduate research';
  const abstract = item?.abstract ?? 'This preview demonstrates the student-facing version detail page. The live record will render the approved metadata, file downloads, version history, and feedback attached to each review cycle.';
  const status = item?.status ?? 'NEEDS_REVISION';
  const version = item?.currentVersion ?? item?.version ?? 2;
  return <UserShell><div className="user-content"><Link className="card-link" href="/student/my-preprints">← Back to my preprints</Link>{!live && <div className="user-notice" style={{ marginTop: 20 }}>Preview detail is shown until this record is available from Preprint BE.</div>}<div className="detail-layout" style={{ marginTop: 22 }}><Panel className="detail-panel"><p className="eyebrow">Preprint / {id}</p><h1>{title}</h1><div className="detail-meta"><span>Version {version}</span><span>Owner and author metadata load from the API.</span></div><StatusBadge status={status} /><h2>Abstract</h2><p className="abstract">{abstract}</p><h2>Version history</h2><div className="timeline"><div className="timeline-item"><strong>Version {version} uploaded</strong><span>Latest manuscript · review metadata attached to this version</span></div><div className="timeline-item"><strong>Review status: {status.replaceAll('_', ' ').toLowerCase()}</strong><span>Feedback remains attached to the submitted version.</span></div></div></Panel><Panel className="detail-side"><div className="status-row"><h2>Status</h2><StatusBadge status={status} /></div><div className="feedback"><strong>Reviewer feedback</strong><br />Reviewer feedback will appear here when the API returns review comments.</div><Link href="/student/my-preprints/new"><Button>Upload revision</Button></Link><Button variant="secondary" disabled>Withdraw submission</Button></Panel></div></div></UserShell>;
}
