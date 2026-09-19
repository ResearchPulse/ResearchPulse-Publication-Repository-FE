'use client';

import { useEffect, useState } from 'react';
import { Button, Panel, SelectInput, TextInput } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { adminApi, type AdminUser } from '../api';

type RoleFilter = 'ALL' | AdminUser['role'];
type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export function AdminUsersView() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('ALL');
  const [active, setActive] = useState<ActiveFilter>('ALL');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Awaited<ReturnType<typeof adminApi.listUsers>> | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, AdminUser['role']>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    adminApi.listUsers({
      page,
      limit: 20,
      search: search.trim() || undefined,
      role: role === 'ALL' ? undefined : role,
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

  useEffect(() => {
    adminApi.listPendingUsers({ limit: 50 })
      .then((next) => setPendingUsers(next.users))
      .catch(() => setPendingUsers([]));
  }, []);

  const decidePendingUser = async (user: AdminUser, decision: 'approve' | 'reject') => {
    if (!window.confirm(`${decision === 'approve' ? 'Approve' : 'Reject'} ${user.email}?`)) return;
    setBusyId(user.id);
    try {
      const updated = decision === 'approve'
        ? await adminApi.approveUser(user.id)
        : await adminApi.rejectUser(user.id);
      setPendingUsers((current) => current.filter((item) => item.id !== user.id));
      setResult((current) => current ? { ...current, users: current.users.map((item) => item.id === updated.id ? updated : item) } : current);
      setMessage(decision === 'approve' ? 'User approved; temporary-password workflow provisioned.' : 'User registration rejected.');
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to process pending registration.');
    } finally {
      setBusyId(null);
    }
  };

  const updateRole = async (user: AdminUser) => {
    const nextRole = roleDrafts[user.id] || user.role;
    if (nextRole === user.role) return;
    if (!window.confirm(`Change ${user.email} role to ${nextRole}?`)) return;

    setBusyId(user.id);
    setMessage(null);
    try {
      const updated = await adminApi.updateUserRole(user.id, nextRole);
      setResult((current) => current ? { ...current, users: current.users.map((item) => item.id === updated.id ? updated : item) } : current);
      setMessage('User role updated successfully.');
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to update user role.');
    } finally {
      setBusyId(null);
    }
  };

  const updateActive = async (user: AdminUser) => {
    const nextActive = !user.isActive;
    if (!window.confirm(`${nextActive ? 'Activate' : 'Deactivate'} ${user.email}?`)) return;

    setBusyId(user.id);
    setMessage(null);
    try {
      const updated = await adminApi.updateUserStatus(user.id, nextActive);
      setResult((current) => current ? { ...current, users: current.users.map((item) => item.id === updated.id ? updated : item) } : current);
      setMessage('User account status updated successfully.');
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to update user status.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell active="users" title="Users">
      <AdminPageHeader
        eyebrow="Access administration"
        title="User management"
        description="Manage roles and account access without exposing passwords or session data."
      />
      <div className="preview-note" role={error ? 'alert' : 'status'}>
        {loading ? 'Loading users...' : error || message || 'Live user data.'}
      </div>
      {pendingUsers.length > 0 && (
        <Panel className="table-shell">
          <h2 style={{ marginTop: 0 }}>Pending registrations</h2>
          <p>Verify/contact these applicants before issuing the temporary password workflow.</p>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Applicant</th><th>Student ID</th><th>Major</th><th /></tr></thead>
              <tbody>{pendingUsers.map((user) => (
                <tr key={user.id}>
                  <td className="title-cell"><strong>{user.name || 'Unnamed user'}</strong><span>{user.email}</span></td>
                  <td>{user.studentId || '—'}</td>
                  <td>{user.major || '—'}</td>
                  <td><div className="review-actions"><Button disabled={busyId === user.id} onClick={() => decidePendingUser(user, 'approve')}>Approve</Button><Button variant="secondary" disabled={busyId === user.id} onClick={() => decidePendingUser(user, 'reject')}>Reject</Button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Panel>
      )}
      <Panel className="table-shell">
        <div className="table-toolbar">
          <TextInput
            className="search-input"
            aria-label="Search users"
            placeholder="Search name or email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
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
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && !error && !result?.users.length && <tr><td colSpan={5}>No users match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
        {result && result.pagination.totalPages > 1 && (
          <div className="table-toolbar" aria-label="User pagination">
            <span>Page {result.pagination.page} of {result.pagination.totalPages} · {result.pagination.total} total</span>
            <div className="review-actions">
              <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</Button>
              <Button variant="secondary" disabled={page >= result.pagination.totalPages || loading} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Panel>
    </AdminShell>
  );
}

export default AdminUsersView;
