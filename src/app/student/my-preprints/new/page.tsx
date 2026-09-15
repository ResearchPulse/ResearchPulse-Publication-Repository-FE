'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Field, Panel, ProgressBar, TextInput } from '@hyperlabdata/ui';
import { UserShell } from '../../../../components/user-shell';
import { preprintApi } from '../../../../lib/student-preprint-api';

export default function NewPreprintPage() {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [supervisorUserId, setSupervisorUserId] = useState('');
  const [authors, setAuthors] = useState('');
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const save = async (submitForReview: boolean) => {
    if (!title.trim() || !authors.trim()) { setMessage('Title and at least one author are required.'); return; }
    setBusy(true); setMessage('Creating draft...'); setProgress(10);
    try {
      const preprint = await preprintApi.create({ title: title.trim(), abstract: abstract.trim(), supervisorUserId: supervisorUserId.trim() || undefined, authors: authors.split(',').map((displayName) => ({ displayName: displayName.trim() })).filter((author) => author.displayName), keywords: keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean) });
      if (file) {
        setMessage('Preparing manuscript upload...'); setProgress(35);
        const upload = await preprintApi.initUpload(preprint.id, { fileName: file.name, mimeType: file.type || 'application/pdf', fileSize: file.size });
        await preprintApi.uploadFile(upload.uploadUrl, file); setProgress(75);
        await preprintApi.completeUpload(preprint.id, { uploadToken: upload.uploadToken }); setProgress(90);
      }
      if (submitForReview) { if (!file) throw new Error('Upload a manuscript file before submitting.'); await preprintApi.submit(preprint.id); setMessage('Submitted successfully. Your lecturer can now review version 1.'); }
      else setMessage('Draft saved successfully.');
      setProgress(100);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save this submission.'); }
    finally { setBusy(false); }
  };

  return <UserShell><div className="user-content"><div className="user-hero"><div><p className="eyebrow">New preprint</p><h1>Give your work a clear first home.</h1><p>Save a draft as you go. Your lecturer will only see the manuscript after you submit it for review.</p></div></div><div className="form-layout"><Panel className="form-panel"><h2>Manuscript details</h2><Field label="Title" hint="Use the title that should appear on the preprint landing page."><TextInput value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Mapping data literacy in undergraduate research" /></Field><Field label="Abstract" hint="A concise summary helps reviewers understand the work quickly."><textarea className="ui-textarea" value={abstract} onChange={(event) => setAbstract(event.target.value)} placeholder="What question does this work answer?" /></Field><div className="two-fields"><Field label="Supervisor user ID" hint="Main User UUID; a directory selector will be added later."><TextInput value={supervisorUserId} onChange={(event) => setSupervisorUserId(event.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></Field><Field label="Keywords"><TextInput value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="data literacy, research methods" /></Field></div><Field label="Authors" hint="Separate authors with commas. You can refine author order before submission."><TextInput value={authors} onChange={(event) => setAuthors(event.target.value)} placeholder="Your name, co-author name" /></Field><div className="upload-box"><strong>Manuscript file</strong><span className="ui-field__hint">PDF, DOCX · maximum 50 MB.</span><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />{file && <><span className="file-name">{file.name}</span><ProgressBar value={progress} /></>}</div>{message && <div className="user-notice" role="status">{message}</div>}<div className="form-actions"><Link href="/student/my-preprints"><Button variant="ghost">Cancel</Button></Link><div className="form-actions__right"><Button variant="secondary" disabled={busy} onClick={() => save(false)}>Save draft</Button><Button disabled={busy} onClick={() => save(true)}>{busy ? 'Saving...' : 'Submit for review'}</Button></div></div></Panel><Panel className="side-panel"><h2>Before you submit</h2><p>Your lecturer reviews the submitted version and can request a revision with actionable feedback.</p><ul className="check-list"><li>Title and abstract are complete</li><li>All authors are listed in order</li><li>Supervisor UUID is identified when applicable</li><li>Manuscript file opens correctly</li></ul></Panel></div></div></UserShell>;
}
