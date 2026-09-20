'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Field, Panel, SelectInput, TextInput } from '@hyperdata/design-system';
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

  // Create-user dialog state
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createRole, setCreateRole] = useState<AdminUser['role']>('STUDENT');
  const [createPassword, setCreatePassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
    <AdminShell active="users" title="Users">
      <AdminPageHeader
        eyebrow="Access administration"
        title="User management"
        description="Manage roles and account access without exposing passwords or session data."
      />
      <div className="preview-note" role={error ? 'alert' : 'status'}>
        {loading ? 'Loading users...' : error || message || 'Live user data.'}
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
