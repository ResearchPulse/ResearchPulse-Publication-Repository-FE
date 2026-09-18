'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { LecturerShell } from '../components/LecturerShell';

export function LecturerProfileView() {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Dr. Alan Turing';
  const displayEmail = user?.email || 'alan.turing@hyperdata.org';

  const getInitials = (name?: string, email?: string) => {
    if (name?.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'AT';
  };

  const initials = getInitials(user?.name, user?.email);

  return (
    <LecturerShell active="profile" title="Profile">
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 1. Academic Identity Hero Banner */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Large Avatar */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#0071bc',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 800,
              flexShrink: 0,
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0, 113, 188, 0.25)',
            }}>
              {initials}
              <span style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '2.5px solid #ffffff',
              }} aria-label="Online" />
            </div>

            {/* Name & Academic Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                  {displayName}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: '#e0f2fe',
                  color: '#0071bc',
                  fontSize: '11.5px',
                  fontWeight: 700,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  Verified Faculty Reviewer
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#64748b' }}>
                Associate Professor · Department of Computer Science & Engineering
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#0071bc', fontWeight: 500 }}>
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Status Chip */}
          <div style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            textAlign: 'right',
          }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reviewer Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', color: '#16a34a', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
              Active · Open Review Pool
            </div>
          </div>
        </div>

        {/* 2. Reviewer Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '20px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Completed Reviews
            </span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
              12
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Peer evaluations submitted
            </span>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '20px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Review Queue
            </span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0071bc', margin: '8px 0 2px' }}>
              1
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Manuscript in active window
            </span>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '20px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Turnaround SLA
            </span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', margin: '8px 0 2px' }}>
              98.5%
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              On-time feedback (48h average)
            </span>
          </div>
        </div>

        {/* 3. Detailed Information Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {/* Card: Academic & Institutional Info */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Academic & Institutional Credentials
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Full Academic Name
                </span>
                <strong style={{ color: '#0f172a' }}>{displayName}</strong>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Institutional Affiliation
                </span>
                <span style={{ color: '#1e293b' }}>Department of Computer Science, Hyperdata Lab</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ORCID Identifier
                </span>
                <span style={{ color: '#0071bc', fontWeight: 600 }}>0000-0002-1825-0097</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Faculty Reviewer ID
                </span>
                <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#334155' }}>
                  REV-2026-0842
                </code>
              </div>
            </div>
          </div>

          {/* Card: Review Preferences & Scope */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              Peer Review Scope & Disciplines
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  Review Disciplines
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Artificial Intelligence', 'Machine Learning', 'Natural Language Processing', 'Distributed Computing', 'Formal Methods'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#334155',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Standard Review Window
                </span>
                <span style={{ color: '#1e293b' }}>48–72 Hours after a manuscript enters review</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Peer Mentorship Policy
                </span>
                <span style={{ color: '#64748b', fontSize: '12.5px', lineHeight: 1.5 }}>
                  Evaluations focus on constructive guidance, methodological rigor, and academic publication readiness.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LecturerShell>
  );
}
