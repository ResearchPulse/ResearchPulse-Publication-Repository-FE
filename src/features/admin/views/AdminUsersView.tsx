'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Field, Panel, SelectInput, TextInput } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { adminApi, type AdminOverview, type AdminUser } from '../api';
import { TableSkeleton } from '@/components/skeleton';
import { SortDropdown } from '@/components/sort-dropdown';
import { useTranslation } from '@/i18n';

type ActiveTab = 'ALL' | 'STUDENT' | 'LECTURER' | 'ADMIN' | 'PENDING';
type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

function getUserInitials(name?: string | null, email?: string): string {
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
  return 'U';
}

export function AdminUsersView() {
  const { t, locale } = useTranslation();
  const [tab, setTab] = useState<ActiveTab>('ALL');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<ActiveFilter>('ALL');
  const [page, setPage] = useState(1);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof adminApi.listUsers>> | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AdminUser['role']>>({});
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Create-user dialog state
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createRole, setCreateRole] = useState<AdminUser['role']>('STUDENT');
  const [createPassword, setCreatePassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'PENDING') {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    adminApi
      .listUsers({
        page,
        limit: 20,
        search: search.trim() || undefined,
        role: tab === 'ALL' ? undefined : (tab as AdminUser['role']),
        isActive: active === 'ALL' ? undefined : active === 'ACTIVE',
      })
      .then((next) => {
        if (mounted) setResult(next);
      })
      .catch((reason: unknown) => {
        if (mounted) setError(reason instanceof Error ? reason.message : 'Unable to load users.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [active, page, role, search]);

  const openCreateDialog = () => {
    setCreateError(null);
    dialogRef.current?.showModal();
  };

  const closeCreateDialog = () => {
    if (!creating) dialogRef.current?.close();
  };

  const createUser = async () => {
    if (!createEmail.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await adminApi.createUser({
        email: createEmail.trim(),
        name: createName.trim() || null,
        role: createRole,
        password: createPassword || undefined,
      });
      setResult((current) => current ? { ...current, users: [created, ...current.users] } : current);
      setCreateEmail('');
      setCreateName('');
      setCreateRole('STUDENT');
      setCreatePassword('');
      setMessage(`Created account for ${created.email}.`);
      dialogRef.current?.close();
    } catch (reason: unknown) {
      setCreateError(reason instanceof Error ? reason.message : 'Unable to create user.');
    } finally {
      setCreating(false);
    }
  };

  const totalUsersCount = overview?.users?.total || result?.pagination?.total || 0;
  const studentsCount = overview?.users?.students || 0;
  const lecturersCount = overview?.users?.lecturers || 0;
  const adminsCount = Math.max(0, totalUsersCount - studentsCount - lecturersCount);

  // Decide pending registration (Approve / Reject)
  const decidePendingUser = async (user: AdminUser, decision: 'approve' | 'reject') => {
    if (!window.confirm(`${decision === 'approve' ? 'Approve' : 'Reject'} registration for ${user.email}?`)) return;
    setBusyId(user.id);
    setMessage(null);
    try {
      const updated =
        decision === 'approve' ? await adminApi.approveUser(user.id) : await adminApi.rejectUser(user.id);
      setPendingUsers((current) => current.filter((item) => item.id !== user.id));
      refreshOverview();
      setMessage(
        decision === 'approve'
          ? `Approved registration for ${user.name || user.email}. Temporary credentials issued.`
          : `Registration for ${user.email} was rejected.`,
      );
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to process pending registration.');
    } finally {
      setBusyId(null);
    }
  };

  // Save role change on Confirm button click
  const handleSaveRole = async (user: AdminUser, newRole: AdminUser['role']) => {
    if (newRole === user.role) return;

    setBusyId(user.id);
    setMessage(null);
    setError(null);
    try {
      const updated = await adminApi.updateUserRole(user.id, newRole);
      setResult((curr) =>
        curr
          ? {
              ...curr,
              users: curr.users.map((item) => (item.id === updated.id ? updated : item)),
            }
          : curr,
      );
      setRoleDrafts((curr) => {
        const next = { ...curr };
        delete next[user.id];
        return next;
      });
      refreshOverview();
      setMessage(`Role updated to ${newRole} for ${user.name || user.email}.`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Unable to update user role.');
    } finally {
      setBusyId(null);
    }
  };

  // Toggle active/inactive status
  const updateActive = async (user: AdminUser) => {
    const nextActive = !user.isActive;
    if (!window.confirm(`${nextActive ? 'Activate' : 'Deactivate'} account for ${user.name || user.email}?`)) return;

    setBusyId(user.id);
    setMessage(null);
    try {
      const updated = await adminApi.updateUserStatus(user.id, nextActive);
      setResult((curr) =>
        curr
          ? {
              ...curr,
              users: curr.users.map((item) => (item.id === updated.id ? updated : item)),
            }
          : curr,
      );
      setMessage(`Account for ${user.email} is now ${nextActive ? 'Active' : 'Inactive'}.`);
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to update user status.');
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (user: AdminUser) => {
    if (!window.confirm(`Delete ${user.email}? This cannot be undone.`)) return;

    setBusyId(user.id);
    setMessage(null);
    try {
      await adminApi.deleteUser(user.id);
      setResult((current) => current ? { ...current, users: current.users.filter((item) => item.id !== user.id) } : current);
      setMessage(`Deleted ${user.email}.`);
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to delete user.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell active="users" title={t('nav.users')} pendingCount={pendingUsers.length}>
      <AdminPageHeader
        eyebrow={t('admin.usersEyebrow')}
        title={t('admin.usersTitle')}
        description={t('admin.usersDesc')}
      />

      {/* Dismissible Feedback Message */}
      {message && (
        <div
          className="user-notice"
          style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f0fdf4',
            borderColor: '#bbf7d0',
            color: '#15803d',
          }}
          role="status"
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontSize: '18px' }}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div
          className="user-notice"
          style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fef2f2',
            borderColor: '#fecaca',
            color: '#b91c1c',
          }}
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '18px' }}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. Metrics Grid (Clean Default Look) */}
      <div className="student-metrics-grid" style={{ marginBottom: '24px' }}>
        <div
          className={`student-metric-card ${tab === 'ALL' ? 'student-metric-card--active' : ''}`}
          onClick={() => {
            setTab('ALL');
            setPage(1);
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon" style={{ background: '#f0f7fc', color: '#0071bc' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{totalUsersCount}</span>
            <span className="student-metric-label">{t('admin.totalAccounts')}</span>
          </div>
        </div>

        <div
          className={`student-metric-card ${tab === 'STUDENT' ? 'student-metric-card--active' : ''}`}
          onClick={() => {
            setTab('STUDENT');
            setPage(1);
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon" style={{ background: '#f0f7fc', color: '#0071bc' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{studentsCount}</span>
            <span className="student-metric-label">{t('admin.students')}</span>
          </div>
        </div>

        <div
          className={`student-metric-card ${tab === 'LECTURER' ? 'student-metric-card--active' : ''}`}
          onClick={() => {
            setTab('LECTURER');
            setPage(1);
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon" style={{ background: '#f0f7fc', color: '#0071bc' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="11" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{lecturersCount}</span>
            <span className="student-metric-label">{t('admin.lecturers')}</span>
          </div>
        </div>

        <div
          className={`student-metric-card ${tab === 'PENDING' ? 'student-metric-card--active' : ''}`}
          onClick={() => {
            setTab('PENDING');
            setPage(1);
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon" style={{ background: '#f0f7fc', color: '#0071bc' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value" style={{ color: pendingUsers.length > 0 ? '#d97706' : undefined }}>
              {pendingUsers.length}
            </span>
            <span className="student-metric-label">{t('admin.pendingApproval')}</span>
          </div>
        </div>
      </div>
      <Panel className="table-shell">
        <div className="table-toolbar users-filter-bar">
          <div className="users-filter-controls">
            <SelectInput aria-label="Filter by role" value={role} onChange={(event) => { setRole(event.target.value as RoleFilter); setPage(1); }}>
              <option value="ALL">All roles</option>
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="ADMIN">Admin</option>
            </SelectInput>
            <SelectInput aria-label="Filter by account status" value={active} onChange={(event) => { setActive(event.target.value as ActiveFilter); setPage(1); }}>
              <option value="ALL">All account states</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectInput>
          </div>
          <div className="users-filter-search">
            <TextInput
              className="search-input"
              aria-label="Search users"
              placeholder="Search name, email, username or student ID"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Button onClick={openCreateDialog}>Create user</Button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Account</th>
                <th>Last login</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {result?.users.map((user) => {
                const draftRole = roleDrafts[user.id] || user.role;
                return (
                  <tr key={user.id}>
                    <td className="title-cell"><strong>{user.name || 'Unnamed user'}</strong><span>{user.email}</span></td>
                    <td>
                      <SelectInput aria-label={`Role for ${user.email}`} value={draftRole} onChange={(event) => setRoleDrafts((current) => ({ ...current, [user.id]: event.target.value as AdminUser['role'] }))}>
                        <option value="STUDENT">Student</option>
                        <option value="LECTURER">Lecturer</option>
                        <option value="ADMIN">Admin</option>
                      </SelectInput>
                    </td>
                    <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                    <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <div className="review-actions">
                        <Button variant="ghost" disabled={busyId === user.id || draftRole === user.role} onClick={() => updateRole(user)}>Save role</Button>
                        <Button variant="secondary" disabled={busyId === user.id} onClick={() => updateActive(user)}>{user.isActive ? 'Deactivate' : 'Activate'}</Button>
                        <Button variant="ghost" disabled={busyId === user.id} onClick={() => removeUser(user)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {tab !== 'PENDING' && result && result.pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              flexWrap: 'wrap',
              gap: '12px',
            }}
            aria-label="User pagination"
          >
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Page <strong>{result.pagination.page}</strong> of <strong>{result.pagination.totalPages}</strong> ·{' '}
              {result.pagination.total} accounts total
            </span>
            <div className="review-actions">
              <Button
                variant="secondary"
                disabled={page <= 1 || loading}
                onClick={() => setPage((c) => c - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= result.pagination.totalPages || loading}
                onClick={() => setPage((c) => c + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>

      <dialog ref={dialogRef} className="users-create-dialog" aria-label="Create user">
        <h2>Create user account</h2>
        <p className="users-create-hint">Creates an approved, active account. Leave the password blank to let the user set one via reset.</p>
        {createError && <div className="users-create-error" role="alert">{createError}</div>}
        <Field label="Email">
          <TextInput
            aria-label="New user email"
            placeholder="new.user@university.edu"
            type="email"
            value={createEmail}
            onChange={(event) => setCreateEmail(event.target.value)}
          />
        </Field>
        <Field label="Full name">
          <TextInput
            aria-label="New user name"
            placeholder="Full name"
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
          />
        </Field>
        <Field label="Role">
          <SelectInput aria-label="New user role" value={createRole} onChange={(event) => setCreateRole(event.target.value as AdminUser['role'])}>
            <option value="STUDENT">Student</option>
            <option value="LECTURER">Lecturer</option>
            <option value="ADMIN">Admin</option>
          </SelectInput>
        </Field>
        <Field label="Initial password" hint="Optional">
          <TextInput
            aria-label="Initial password"
            placeholder="Password (optional)"
            type="password"
            value={createPassword}
            onChange={(event) => setCreatePassword(event.target.value)}
          />
        </Field>
        <div className="review-actions users-create-actions">
          <Button variant="secondary" disabled={creating} onClick={closeCreateDialog}>Cancel</Button>
          <Button disabled={creating || !createEmail.trim()} onClick={createUser}>
            {creating ? 'Creating...' : 'Create user'}
          </Button>
        </div>
      </dialog>
    </AdminShell>
  );
}

export default AdminUsersView;
