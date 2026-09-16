'use client';

import { useEffect, useState } from 'react';
import { ApiPendingState, StudentShell } from '../components';
import { studentPreprintApi, ApiUnavailableError } from '../api';

export function PreprintVersionsView({ id }: { id: string }) {
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => { studentPreprintApi.versions(id).catch((reason: unknown) => { setError(reason instanceof Error ? reason : new Error('Unable to load versions.')); }); }, [id]);
  return <StudentShell title="Version history"><p className="student-intro">Every revision will remain attached to the manuscript record.</p>{error instanceof ApiUnavailableError && <ApiPendingState />}{error && !(error instanceof ApiUnavailableError) && <p className="student-error">{error.message}</p>}</StudentShell>;
}

export default PreprintVersionsView;
