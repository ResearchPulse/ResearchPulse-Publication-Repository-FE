'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { Button, Panel, StatusBadge } from '@hyperlabdata/ui';
import { AdminSidebar, Topbar } from '../../../components/admin-shell';

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [decision, setDecision] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const handleReview = (nextDecision: string) => {
    if (nextDecision !== 'APPROVE' && !comment.trim()) { setMessage('Add a comment for revision requests or rejection.'); return; }
    setDecision(nextDecision);
    setMessage('Preview action recorded locally. Connect Preprint BE to persist this decision.');
  };
  return <div className="admin-frame"><AdminSidebar active="submissions" /><main className="admin-main"><Topbar title="Submission detail" /><div className="content"><Link className="back-link" href="/submissions">← Back to submissions</Link><div className="preview-note">Preview submission: <strong>{id}</strong>. No live record is loaded until the Preprint API is connected.</div><div className="detail-grid"><Panel className="detail-panel"><div className="page-head"><div><p className="eyebrow">Version 1 · student research</p><h2>Mapping data literacy in undergraduate research</h2></div><StatusBadge status="SUBMITTED" /></div><p className="abstract">This preview demonstrates the review surface for a student manuscript. The live version will show abstract, authors, keywords, PDF access, and version-specific feedback.</p><h3>Version history</h3><div className="timeline"><div className="timeline-item"><strong>Version 1 uploaded</strong><span>Created by student · PDF metadata pending</span></div><div className="timeline-item"><strong>Submitted for review</strong><span>Awaiting assignment</span></div></div><h3>Audit timeline</h3><p className="abstract">Audit events will be rendered from preprint_events.</p></Panel><Panel className="detail-panel"><h2>Review decision</h2><div className="review-form"><label className="ui-field"><span className="ui-field__label">Comment</span><textarea className="ui-textarea" placeholder="Write specific, actionable feedback" value={comment} onChange={(event) => setComment(event.target.value)} /></label>{message && <p className="preview-note" role="status">{message}</p>}<div className="review-actions"><Button variant="secondary" onClick={() => handleReview('REQUEST_REVISION')}>Request revision</Button><Button variant="danger" onClick={() => handleReview('REJECT')}>Reject</Button><Button onClick={() => handleReview('APPROVE')}>Approve</Button></div>{decision && <p className="abstract">Selected: <strong>{decision}</strong>. Publish remains a separate action.</p>}</div><h3>Assignment</h3><p className="abstract">Reviewer assignment panel will appear for administrators.</p><Button variant="secondary" disabled>Publish after approval</Button></Panel></div></div></main></div>;
}
