'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { AdminShell } from '../components/AdminShell';

export function AdminProfileView() {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Administrator';
  const displayEmail = user?.email || 'admin@hyperdata.org';

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
    return 'AD';
  };

  const initials = getInitials(user?.name, user?.email);

  return (
    <AdminShell active="profile" title="Profile">
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                  System Administrator
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#64748b' }}>
                System Administrator · Hyperdata Lab
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#0071bc', fontWeight: 500 }}>
                {displayEmail}
              </p>
            </div>
          </div>
        </div>

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
            Account Credentials
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Full Name
              </span>
              <strong style={{ color: '#0f172a' }}>{displayName}</strong>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </span>
              <span style={{ color: '#1e293b' }}>{displayEmail}</span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Account Role
              </span>
              <span style={{ color: '#0071bc', fontWeight: 600 }}>
                {user?.role === 'ADMIN' ? 'System Administrator (ADMIN)' : 'Administrator'}
              </span>
            </div>
            
            <div>
              <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                User ID
              </span>
              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#334155' }}>
                {user?.id ? user.id.slice(0, 16) + '…' : 'N/A'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

export default AdminProfileView;
