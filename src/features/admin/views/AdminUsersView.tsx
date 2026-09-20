'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { adminApi, type AdminUser } from '../api';
import { TableSkeleton } from '@/components/skeleton';
import { useTranslation } from '@/i18n';

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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number; total: number } | null>(null);
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const refreshPending = (targetPage = page) => {
    setLoading(true);
    adminApi
      .listPendingUsers({ page: targetPage, limit: PAGE_SIZE })
      .then((next) => {
        setPendingUsers(next.users);
        setPagination(next.pagination);
        // ponytail: snap back if the last item on the last page was removed
        if (next.users.length === 0 && targetPage > 1) {
          setPage(targetPage - 1);
        }
      })
      .catch((reason: unknown) => {
        setPendingUsers([]);
        setPagination(null);
        setError(reason instanceof Error ? reason.message : 'Unable to load pending registrations.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshPending(page);
  }, [page]);

  // SSE: new registration → refetch list; auto-reconnect; refetch on tab focus (mobile kills SSE in background)
  useEffect(() => {
    let es: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const connect = () => {
      es = new EventSource('/api/admin/registrations/stream');
      es.addEventListener('registration:new', () => {
        refreshPending(page);
        setMessage(locale === 'vi' ? 'Có đăng ký mới chờ duyệt.' : 'A new registration is awaiting review.');
      });
      // EventSource auto-reconnects on network drop; recreate manually if it ends up closed
      // (e.g. server proxy killed the stream) with capped backoff.
      es.onerror = () => {
        if (closed) return;
        if (es && es.readyState === EventSource.CLOSED) {
          retry = setTimeout(connect, 3000);
        }
        // CONNECTING = native auto-reconnect in progress: nothing to do
      };
    };
    connect();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshPending(page); // catch up on anything missed while backgrounded
        const dead = !es || es.readyState === EventSource.CLOSED;
        if (dead && !retry) connect();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      closed = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (retry) clearTimeout(retry);
      es?.close();
    };
  }, [page]);

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

  // Approve = issue temp password + email; Reject = mark registration rejected
  const decidePendingUser = async (user: AdminUser, decision: 'approve' | 'reject') => {
    if (!window.confirm(`${decision === 'approve' ? 'Approve' : 'Reject'} registration for ${user.email}?`)) return;
    setBusyId(user.id);
    setMessage(null);
    setError(null);
    try {
      await (decision === 'approve' ? adminApi.approveUser(user.id) : adminApi.rejectUser(user.id));
      refreshPending(page);
      setMessage(
        decision === 'approve'
          ? `Approved registration for ${user.name || user.email}. Temporary credentials have been emailed.`
          : `Registration for ${user.email} was rejected.`,
      );
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Unable to process pending registration.');
    } finally {
      setBusyId(null);
    }
  };


  return (
    <AdminShell active="users" title={t('nav.users')} pendingCount={pagination?.total ?? pendingUsers.length}>
      <AdminPageHeader
        eyebrow={t('admin.usersEyebrow')}
        title={locale === 'vi' ? 'Quản lý đăng ký' : 'Registration Management'}
        description={
          locale === 'vi'
            ? 'Xét duyệt yêu cầu đăng ký tài khoản sinh viên: phê duyệt để cấp tài khoản kèm mật khẩu tạm qua email, hoặc từ chối.'
            : 'Review student account registration requests: approve to issue credentials via email, or reject.'
        }
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

      {/* Filter Toolbar: search only */}
      <div className="student-filter-toolbar" style={{ marginBottom: '20px' }}>
        <div className="student-tabs-pills" role="status">
          <span className={`student-tab-pill student-tab-pill--active`}>
            {locale === 'vi' ? 'Chờ phê duyệt' : 'Pending approval'}{' '}
            <span className="student-tab-pill__count">{pagination?.total ?? pendingUsers.length}</span>
          </span>
        </div>

        <div className="student-search-sort-group">
          <div className="student-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder={locale === 'vi' ? 'Tìm theo tên, email, MSSV, ngành...' : 'Search by name, email, student ID, major...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="student-search-input"
              aria-label="Search pending registrations"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="student-search-clear"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pending Registrations Table */}
      <div className="admin-users-card">
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
              {loading ? (
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
                            {user.name || (locale === 'vi' ? 'Chưa có tên' : 'Unnamed Applicant')}
                          </div>
                          <span className="admin-user-email">{user.email}</span>
                          {user.attemptNumber && user.attemptNumber > 1 && (
                            <details style={{ marginTop: 4 }}>
                              <summary style={{ fontSize: 12, color: '#b91c1c', cursor: 'pointer', fontWeight: 600 }}>
                                {locale === 'vi'
                                  ? `Đăng ký lại lần thứ ${user.attemptNumber}`
                                  : `Re-registration #${user.attemptNumber}`}
                              </summary>
                              <ul style={{ margin: '6px 0 0', paddingLeft: 16, fontSize: 12, color: '#475569' }}>
                                {(user.rejectionHistory ?? []).map((h) => (
                                  <li key={h.id}>
                                    {locale === 'vi' ? 'Lần' : 'Attempt'} {h.attemptNumber}: {h.name || '—'} · {h.studentId || '—'} · {h.major || '—'} ·{' '}
                                    {locale === 'vi' ? 'bị từ chối' : 'rejected'}{' '}
                                    {new Date(h.rejectedAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : undefined, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
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
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                          : locale === 'vi' ? 'Gần đây' : 'Recently'}
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
                      {locale === 'vi' ? 'Không có đăng ký chờ duyệt' : 'No pending registrations'}
                    </div>
                    <div style={{ fontSize: '12.5px' }}>
                      {locale === 'vi'
                        ? 'Tất cả yêu cầu đăng ký đã được xử lý.'
                        : 'All registration requests have been processed.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
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
            aria-label="Pending registrations pagination"
          >
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              {locale === 'vi' ? 'Trang' : 'Page'} <strong>{pagination.page}</strong> / <strong>{pagination.totalPages}</strong>
              {' · '}
              {pagination.total} {locale === 'vi' ? 'đăng ký chờ duyệt' : 'pending registrations'}
            </span>
            <div className="review-actions">
              <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((c) => c - 1)}>
                {locale === 'vi' ? 'Trước' : 'Previous'}
              </Button>
              <Button
                variant="secondary"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((c) => c + 1)}
              >
                {locale === 'vi' ? 'Sau' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export default AdminUsersView;
