import Link from 'next/link';
import type { ReactNode } from 'react';

export function StudentShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="student-frame">
      <header className="student-header">
        <a href="/" className="student-brand" aria-label="Hyperdata Lab Preprint Repository">
          <img src="/images/hyperdata-lab-logo.png" alt="Hyperdata Lab" />
          <span>/ Preprint Repository</span>
        </a>
        <nav aria-label="Student navigation">
          <Link href="/student/my-preprints">My preprints</Link>
          <a href="/api/auth/logout">Sign out</a>
        </nav>
      </header>
      <main className="student-main">
        <p className="student-kicker">Student workspace</p>
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}

export default StudentShell;
