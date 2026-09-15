'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Panel, StatusBadge } from '@hyperlabdata/ui';
import { UserShell } from '../../../components/user-shell';
import { preprintApi } from '../../../lib/student-preprint-api';
import type { Preprint } from '../../../lib/student-types';

const previewItems: Preprint[] = [
  { id: 'preview-001', title: 'Mapping data literacy in undergraduate research', abstract: 'A student-led study exploring how research teams build confidence with data.', status: 'NEEDS_REVISION', version: 2, updatedAt: 'Preview item' },
  { id: 'preview-002', title: 'Open methods for small research teams', abstract: 'Practical methods for making early-stage research easier to reproduce.', status: 'UNDER_REVIEW', version: 1, updatedAt: 'Preview item' },
];

export default function MyPreprintsPage() {
  const [items, setItems] = useState<Preprint[]>(previewItems);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    preprintApi.listMine().then((result) => { setItems(result.items); setLive(true); }).catch(() => undefined).finally(() => setLoading(false));
  }, []);
  return <UserShell><div className="user-content"><div className="user-hero"><div><p className="eyebrow">Student research workspace</p><h1>Your preprints.</h1><p>Prepare a manuscript, keep feedback in one place, and submit when your work is ready for lecturer review.</p></div><Link href="/student/my-preprints/new"><Button>Start a submission</Button></Link></div>{!live && <div className="user-notice">{loading ? 'Loading your submissions...' : 'Preprint API is unavailable, so preview data is shown. Your work is not affected.'}</div>}<div className="user-grid">{items.map((item) => <Panel className="preprint-card" key={item.id}><div className="preprint-card__top"><StatusBadge status={item.status} /><span>v{item.currentVersion ?? item.version}</span></div><div><h2>{item.title}</h2><p>{item.abstract}</p></div><div className="preprint-card__bottom"><span>{item.updatedAt}</span><Link className="card-link" href={`/student/my-preprints/${item.id}`}>Open →</Link></div></Panel>)}</div></div></UserShell>;
}
