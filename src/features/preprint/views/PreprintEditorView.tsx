'use client';

import { useState } from 'react';
import { Button } from '@hyperdata/design-system';
import { ApiPendingState, StudentShell } from '../components';
import { studentPreprintApi } from '../api';
import { usePreprintMutation } from '../hooks';

export function PreprintEditorView({ id }: { id?: string }) {
  const [title, setTitle] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const mutation = usePreprintMutation(async (payload: { title: string; abstract: string }) => {
    if (id) return studentPreprintApi.update(id, payload);
    return studentPreprintApi.create(payload);
  });
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !abstractText.trim()) return;
    try {
      await mutation.execute({ title, abstract: abstractText });
    } catch { /* the visible mutation error is rendered below */ }
  };

  return <StudentShell title={id ? 'Edit preprint' : 'Start a preprint'}>
    <p className="student-intro">Draft your metadata first. PDF upload and submission will activate when the corresponding Public BE APIs are implemented.</p>
    {mutation.apiPending && <ApiPendingState />}
    {mutation.error && !mutation.apiPending && <p className="student-error">{mutation.error.message}</p>}
    <form className="preprint-form" onSubmit={submit}>
      <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Your research title" required /></label>
      <label>Abstract<textarea value={abstractText} onChange={(event) => setAbstractText(event.target.value)} placeholder="Summarize the research question and findings" rows={8} required /></label>
      <div className="student-form-actions"><Button type="submit" variant="primary" disabled={mutation.loading}>{mutation.loading ? 'Saving…' : 'Save draft'}</Button><span className="student-muted">No data is saved while the API is unavailable.</span></div>
    </form>
  </StudentShell>;
}

export default PreprintEditorView;
