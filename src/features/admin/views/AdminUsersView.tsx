'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Field, SelectInput, TextInput } from '@hyperdata/design-system';
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

  // Create user via dialog
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
      if (tab !== 'PENDING') {
        setResult((curr) => (curr ? { ...curr, users: [created, ...curr.users] } : curr));
      }
      setCreateEmail('');
      setCreateName('');
      setCreateRole('STUDENT');
      setCreatePassword('');
      setMessage(`Created account for ${created.email}.`);
      refreshOverview();
      dialogRef.current?.close();
    } catch (reason: unknown) {
      setCreateError(reason instanceof Error ? reason.message : 'Unable to create user.');
    } finally {
      setCreating(false);
    }
  };

  // Delete user
  const removeUser = async (user: AdminUser) => {
    if (!window.confirm(`Delete ${user.email}? This cannot be undone.`)) return;

    setBusyId(user.id);
    setMessage(null);
    try {
      await adminApi.deleteUser(user.id);
      setResult((curr) => (curr ? { ...curr, users: curr.users.filter((item) => item.id !== user.id) } : curr));
      refreshOverview();
      setMessage(`Deleted ${user.email}.`);
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to delete user.');
    } finally {
      setBusyId(null);
    }
  };

  // Fetch overview metrics
  const refreshOverview = () => {
    adminApi
      .overview()
      .then((data) => setOverview(data))
      .catch(() => {});
  };

  const refreshPending = () => {
    setLoadingPending(true);
    adminApi
      .listPendingUsers({ limit: 50 })
      .then((next) => setPendingUsers(next.users))
      .catch(() => setPendingUsers([]))
      .finally(() => setLoadingPending(false));
  };

  useEffect(() => {
    refreshOverview();
    refreshPending();
  }, []);

  // Fetch users when tab (role), active status, search or page changes
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
  }, [active, page, search, tab]);

  // Filter pending users locally by search
  const filteredPendingUsers = useMemo(() => {
    if (!search.trim()) return pendingUsers;
    const q = search.toLowerCase().trim();
    return pendingUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.studentId?.toLowerCase().includes(q) ||
        u.major?.toLowerCase().includes(q),
    );
  }, [pendingUsers, search]);

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
            ├ù
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
            ├ù
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

      {/* 2. Filter Toolbar */}
      <div className="student-filter-toolbar" style={{ marginBottom: '20px' }}>
        <div className="student-tabs-pills" role="tablist" aria-label="Filter users by category">
          <button
            type="button"
            className={`student-tab-pill ${tab === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setTab('ALL');
              setPage(1);
            }}
          >
            {t('common.all')} <span className="student-tab-pill__count">{totalUsersCount}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${tab === 'STUDENT' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setTab('STUDENT');
              setPage(1);
            }}
          >
            {t('admin.students')} <span className="student-tab-pill__count">{studentsCount}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${tab === 'LECTURER' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setTab('LECTURER');
              setPage(1);
            }}
          >
            {t('admin.lecturers')} <span className="student-tab-pill__count">{lecturersCount}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${tab === 'ADMIN' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setTab('ADMIN');
              setPage(1);
            }}
          >
            {t('admin.admins')} <span className="student-tab-pill__count">{adminsCount}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${tab === 'PENDING' ? 'student-tab-pill--active student-tab-pill--alert' : ''}`}
            onClick={() => {
              setTab('PENDING');
              setPage(1);
            }}
          >
            {t('admin.pendingApproval')} <span className="student-tab-pill__count">{pendingUsers.length}</span>
          </button>
        </div>

        <div className="student-search-sort-group">
          <div className="student-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder={tab === 'PENDING' ? t('common.searchUsersPending') : t('common.searchUsersAll')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="student-search-input"
              aria-label="Search users"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="student-search-clear"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {tab !== 'PENDING' && (
            <div className="student-sort-box">
              <span className="student-sort-label">{t('common.status')}:</span>
              <SortDropdown
                value={active}
                onChange={(val) => {
                  setActive(val as ActiveFilter);
                  setPage(1);
                }}
                options={[
                  { value: 'ALL', label: locale === 'vi' ? 'Tất cả trạng thái tài khoản' : 'All account states' },
                  { value: 'ACTIVE', label: t('admin.active') },
                  { value: 'INACTIVE', label: t('admin.inactive') },
                ]}
                style={{ width: '180px' }}
              />
            </div>
          )}

          <Button onClick={openCreateDialog}>{locale === 'vi' ? '+ Thêm người dùng' : '+ Create user'}</Button>
        </div>
      </div>

      {/* 3. Table Card Container */}
      <div className="admin-users-card">
        {tab === 'PENDING' ? (
          /* PENDING REGISTRATIONS QUEUE */
          <div className="table-wrap">
            <table className="data-table admin-users-table">
              <thead>
                <tr>
                  <th>{locale === 'vi' ? 'Người đăng ký' : 'Applicant'}</th>
                  <th>{locale === 'vi' ? 'Mã sinh viên' : 'Student ID'}</th>
                  <th>{locale === 'vi' ? 'Ngành học' : 'Major'}</th>
                  <th>{locale === 'vi' ? 'Ngày đăng ký' : 'Registered'}</th>
                  <th style={{ textAlign: 'right' }}>{locale === 'vi' ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {loadingPending ? (
                  <TableSkeleton rows={4} type="users" />
                ) : filteredPendingUsers.length > 0 ? (
                  filteredPendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">
                            {getUserInitials(user.name, user.email)}
                          </div>
                          <div className="admin-user-info">
                            <div className="admin-user-name">
                              {user.name || 'Unnamed Applicant'}
                            </div>
                            <span className="admin-user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {user.studentId || '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#475569' }}>
                          {user.major || '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
                        </span>
                      </td>
                      <td>
                        <div className="review-actions">
                          <Button
                            variant="primary"
                            disabled={busyId === user.id}
                            onClick={() => decidePendingUser(user, 'approve')}
                          >
                            {locale === 'vi' ? 'Phê duyệt' : 'Approve'}
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={busyId === user.id}
                            onClick={() => decidePendingUser(user, 'reject')}
                          >
                            {locale === 'vi' ? 'Từ chối' : 'Reject'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                        No pending registrations
                      </div>
                      <div style={{ fontSize: '12.5px' }}>
                        All applicant verification requests have been cleared or verified.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ACTIVE / ALL USERS DIRECTORY */
          <div className="table-wrap">
            <table className="data-table admin-users-table">
              <thead>
                <tr>
                  <th>{locale === 'vi' ? 'Người dùng' : 'User'}</th>
                  <th>{locale === 'vi' ? 'Vai trò' : 'Role'}</th>
                  <th>{locale === 'vi' ? 'Trạng thái' : 'Account Status'}</th>
                  <th>{locale === 'vi' ? 'Đăng nhập cuối' : 'Last Login'}</th>
                  <th style={{ textAlign: 'right' }}>{locale === 'vi' ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton rows={6} type="users" />
                ) : result?.users && result.users.length > 0 ? (
                  result.users.map((user) => {
                    const draftRole = roleDrafts[user.id] || user.role;
                    return (
                      <tr key={user.id}>
                      {/* USER COLUMN */}
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">
                            {getUserInitials(user.name, user.email)}
                          </div>
                          <div className="admin-user-info">
                            <div className="admin-user-name">
                              <span>{user.name || 'Unnamed User'}</span>
                              {user.studentId && (
                                <span className="admin-user-subtag">
                                  ID: {user.studentId}
                                </span>
                              )}
                              {user.major && (
                                <span className="admin-user-subtag">
                                  {user.major}
                                </span>
                              )}
                            </div>
                            <span className="admin-user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* ROLE COLUMN: INLINE CUSTOM DROPDOWN */}
                      <td style={{ minWidth: '150px' }}>
                        <SortDropdown
                          value={draftRole}
                          disabled={busyId === user.id}
                          size="sm"
                          options={[
                            { value: 'STUDENT', label: locale === 'vi' ? 'Sinh viên' : 'Student' },
                            { value: 'LECTURER', label: locale === 'vi' ? 'Giảng viên' : 'Lecturer' },
                            { value: 'ADMIN', label: locale === 'vi' ? 'Quản trị viên' : 'Admin' },
                          ]}
                          onChange={(val) =>
                            setRoleDrafts((curr) => ({
                              ...curr,
                              [user.id]: val as AdminUser['role'],
                            }))
                          }
                          ariaLabel={`Role for ${user.email}`}
                          style={{ width: '135px' }}
                        />
                      </td>

                      {/* ACCOUNT STATUS COLUMN */}
                      <td>
                        <span
                          className={`admin-status-pill ${
                            user.isActive ? 'admin-status-pill--active' : 'admin-status-pill--inactive'
                          }`}
                        >
                          <span
                            className={`admin-status-dot ${
                              user.isActive ? 'admin-status-dot--active' : 'admin-status-dot--inactive'
                            }`}
                          />
                          <span>{user.isActive ? (locale === 'vi' ? 'Hoạt động' : 'Active') : (locale === 'vi' ? 'Vô hiệu' : 'Inactive')}</span>
                        </span>
                      </td>

                      {/* LAST LOGIN COLUMN */}
                      <td>
                        <span style={{ fontSize: '12.5px', color: user.lastLoginAt ? '#334155' : '#94a3b8' }}>
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : (locale === 'vi' ? 'Chưa từng' : 'Never')}
                        </span>
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td>
                        <div className="review-actions">
                          <Button
                            variant="ghost"
                            disabled={busyId === user.id || draftRole === user.role}
                            onClick={() => handleSaveRole(user, draftRole)}
                          >
                            {locale === 'vi' ? 'Lưu vai trò' : 'Save role'}
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={busyId === user.id}
                            onClick={() => updateActive(user)}
                          >
                            {user.isActive ? (locale === 'vi' ? 'Vô hiệu hóa' : 'Deactivate') : (locale === 'vi' ? 'Kích hoạt' : 'Activate')}
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={busyId === user.id}
                            onClick={() => removeUser(user)}
                            style={{ color: '#dc2626' }}
                          >
                            {locale === 'vi' ? 'Xóa' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                        No users found
                      </div>
                      <div style={{ fontSize: '12.5px' }}>
                        No accounts match your current filter and search keyword.
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
      </div>

      <dialog ref={dialogRef} className="users-create-dialog" aria-label="Create user">
        <h2>{locale === 'vi' ? 'Tạo tài khoản người dùng' : 'Create user account'}</h2>
        <p className="users-create-hint">
          {locale === 'vi'
            ? 'Tạo tài khoản đã được phê duyệt và kích hoạt. Có thể để trống mật khẩu để người dùng tự thiết lập qua liên kết đổi mật khẩu.'
            : 'Creates an approved, active account. Leave the password blank to let the user set one via reset.'}
        </p>
        {createError && <div className="users-create-error" role="alert">{createError}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createUser();
          }}
          style={{ padding: '0 28px' }}
        >
          <Field label={locale === 'vi' ? 'Địa chỉ Email *' : 'Email *'}>
            <TextInput
              aria-label="New user email"
              placeholder="new.user@university.edu"
              type="email"
              required
              value={createEmail}
              onChange={(event) => setCreateEmail(event.target.value)}
            />
          </Field>
          <div style={{ marginTop: '12px' }}>
            <Field label={locale === 'vi' ? 'Họ và tên' : 'Full name'}>
              <TextInput
                aria-label="New user name"
                placeholder={locale === 'vi' ? 'Họ và tên' : 'Full name'}
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
              />
            </Field>
          </div>
          <div style={{ marginTop: '12px' }}>
            <Field label={locale === 'vi' ? 'Vai trò' : 'Role'}>
              <SelectInput aria-label="New user role" value={createRole} onChange={(event) => setCreateRole(event.target.value as AdminUser['role'])}>
                <option value="STUDENT">{locale === 'vi' ? 'Sinh viên' : 'Student'}</option>
                <option value="LECTURER">{locale === 'vi' ? 'Giảng viên' : 'Lecturer'}</option>
                <option value="ADMIN">{locale === 'vi' ? 'Quản trị viên' : 'Admin'}</option>
              </SelectInput>
            </Field>
          </div>
          <div style={{ marginTop: '12px' }}>
            <Field label={locale === 'vi' ? 'Mật khẩu ban đầu (tùy chọn)' : 'Initial password'} hint={locale === 'vi' ? 'Tùy chọn' : 'Optional'}>
              <TextInput
                aria-label="Initial password"
                placeholder={locale === 'vi' ? 'Mật khẩu (tùy chọn)' : 'Password (optional)'}
                type="password"
                value={createPassword}
                onChange={(event) => setCreatePassword(event.target.value)}
              />
            </Field>
          </div>
          <div className="review-actions users-create-actions" style={{ marginTop: '20px', padding: '0 0 24px 0' }}>
            <Button variant="secondary" type="button" disabled={creating} onClick={closeCreateDialog}>
              {locale === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button variant="primary" type="submit" disabled={creating || !createEmail.trim()}>
              {creating ? (locale === 'vi' ? 'Đang tạo...' : 'Creating...') : locale === 'vi' ? 'Tạo người dùng' : 'Create user'}
            </Button>
          </div>
        </form>
      </dialog>
    </AdminShell>
  );
}

export default AdminUsersView;
