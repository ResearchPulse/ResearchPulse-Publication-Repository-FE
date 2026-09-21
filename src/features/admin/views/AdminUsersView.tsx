'use client';

import { useEffect, useState } from 'react';
import { Button } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { adminApi, type AdminUser, type AdminOverview } from '../api';
import { TableSkeleton } from '@/components/skeleton';
import { SortDropdown } from '@/components/sort-dropdown';
import { useTranslation } from '@/i18n';

type AccountRoleTab = 'ALL' | 'STUDENT' | 'LECTURER' | 'ADMIN';
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
  const [roleTab, setRoleTab] = useState<AccountRoleTab>('ALL');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL');
  const [page, setPage] = useState(1);

  // Data states
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [accounts, setAccounts] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number; total: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Create User Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    studentId: '',
    major: '',
    role: 'STUDENT' as AdminUser['role'],
    password: '',
  });

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    isDanger?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  const PAGE_SIZE = 10;

  // Refresh Overview metrics
  const refreshOverview = () => {
    adminApi
      .overview()
      .then((data) => setOverview(data))
      .catch(() => {});
  };

  // Refresh System Accounts
  const refreshAccounts = (targetPage = page) => {
    setLoading(true);
    const roleParam = roleTab === 'ALL' ? undefined : roleTab;
    const isActiveParam = activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE';

    adminApi
      .listUsers({
        page: targetPage,
        limit: PAGE_SIZE,
        role: roleParam,
        search: search.trim() || undefined,
        isActive: isActiveParam,
      })
      .then((res) => {
        setAccounts(res.users || []);
        setPagination(res.pagination || null);
        if (res.users?.length === 0 && targetPage > 1) {
          setPage(targetPage - 1);
        }
      })
      .catch((reason: unknown) => {
        setAccounts([]);
        setPagination(null);
        setError(reason instanceof Error ? reason.message : 'Unable to load accounts.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshOverview();
  }, []);

  useEffect(() => {
    refreshAccounts(page);
  }, [roleTab, page, activeFilter]);

  // Debounced search for accounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      refreshAccounts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Toggle User Active/Suspended status
  const handleToggleActive = (user: AdminUser) => {
    const willActive = !user.isActive;
    setConfirmModal({
      open: true,
      title: willActive
        ? (locale === 'vi' ? 'Mở khóa tài khoản' : 'Activate Account')
        : (locale === 'vi' ? 'Khóa tài khoản' : 'Suspend Account'),
      description: willActive
        ? (locale === 'vi' ? `Xác nhận mở khóa và cho phép ${user.email} đăng nhập lại hệ thống?` : `Activate and allow ${user.email} to log in again?`)
        : (locale === 'vi' ? `Xác nhận tạm khóa tài khoản ${user.email}? Người dùng này sẽ không thể đăng nhập cho đến khi được mở khóa.` : `Suspend ${user.email}? This user will not be able to log in until unlocked.`),
      confirmLabel: willActive ? (locale === 'vi' ? 'Mở khóa' : 'Activate') : (locale === 'vi' ? 'Khóa tài khoản' : 'Suspend'),
      cancelLabel: locale === 'vi' ? 'Hủy' : 'Cancel',
      isDanger: !willActive,
      onConfirm: async () => {
        setBusyId(user.id);
        setMessage(null);
        setError(null);
        try {
          await adminApi.updateUserStatus(user.id, willActive);
          refreshAccounts(page);
          refreshOverview();
          setMessage(
            willActive
              ? (locale === 'vi' ? `Đã mở khóa tài khoản ${user.email}.` : `Activated ${user.email}.`)
              : (locale === 'vi' ? `Đã tạm khóa tài khoản ${user.email}.` : `Suspended ${user.email}.`),
          );
        } catch (reason: unknown) {
          setError(reason instanceof Error ? reason.message : 'Unable to update account status.');
        } finally {
          setBusyId(null);
          setConfirmModal(null);
        }
      },
    });
  };

  // Change User Role
  const handleChangeRole = (user: AdminUser, newRole: AdminUser['role']) => {
    if (newRole === user.role) return;
    const roleNames: Record<AdminUser['role'], string> = {
      STUDENT: locale === 'vi' ? 'Sinh viên' : 'Student',
      LECTURER: locale === 'vi' ? 'Giảng viên' : 'Lecturer',
      ADMIN: locale === 'vi' ? 'Quản trị viên' : 'Admin',
    };

    setConfirmModal({
      open: true,
      title: locale === 'vi' ? 'Thay đổi vai trò người dùng' : 'Change User Role',
      description: locale === 'vi'
        ? `Xác nhận chuyển vai trò của ${user.email} từ ${roleNames[user.role]} sang ${roleNames[newRole]}?`
        : `Change role for ${user.email} from ${user.role} to ${newRole}?`,
      confirmLabel: locale === 'vi' ? 'Cập nhật' : 'Update',
      cancelLabel: locale === 'vi' ? 'Hủy' : 'Cancel',
      onConfirm: async () => {
        setBusyId(user.id);
        setMessage(null);
        setError(null);
        try {
          await adminApi.updateUserRole(user.id, newRole);
          refreshAccounts(page);
          refreshOverview();
          setMessage(
            locale === 'vi'
              ? `Đã chuyển vai trò của ${user.email} thành ${roleNames[newRole]}.`
              : `Updated role of ${user.email} to ${newRole}.`,
          );
        } catch (reason: unknown) {
          setError(reason instanceof Error ? reason.message : 'Unable to change user role.');
        } finally {
          setBusyId(null);
          setConfirmModal(null);
        }
      },
    });
  };

  // Delete User
  const handleDeleteUser = (user: AdminUser) => {
    setConfirmModal({
      open: true,
      title: locale === 'vi' ? 'Xóa người dùng' : 'Delete User',
      description: locale === 'vi'
        ? `Xác nhận xóa vĩnh viễn tài khoản ${user.email}? Hành động này không thể hoàn tác.`
        : `Are you sure you want to permanently delete account ${user.email}? This action cannot be undone.`,
      confirmLabel: locale === 'vi' ? 'Xóa người dùng' : 'Delete User',
      cancelLabel: locale === 'vi' ? 'Hủy' : 'Cancel',
      isDanger: true,
      onConfirm: async () => {
        setBusyId(user.id);
        setMessage(null);
        setError(null);
        try {
          await adminApi.deleteUser(user.id);
          refreshAccounts(page);
          refreshOverview();
          setMessage(locale === 'vi' ? `Đã xóa tài khoản ${user.email}.` : `Deleted account ${user.email}.`);
        } catch (reason: unknown) {
          setError(reason instanceof Error ? reason.message : 'Unable to delete user.');
        } finally {
          setBusyId(null);
          setConfirmModal(null);
        }
      },
    });
  };

  // Create User submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email.trim()) return;

    setBusyId('create');
    setMessage(null);
    setError(null);
    try {
      await adminApi.createUser({
        email: createForm.email.trim(),
        name: createForm.name.trim() || undefined,
        studentId: createForm.studentId.trim() || undefined,
        major: createForm.major.trim() || undefined,
        role: createForm.role,
        password: createForm.password.trim() || undefined,
      });
      setIsCreateOpen(false);
      setCreateForm({ name: '', email: '', studentId: '', major: '', role: 'STUDENT', password: '' });
      refreshAccounts(1);
      refreshOverview();
      setMessage(locale === 'vi' ? `Đã tạo tài khoản mới thành công.` : `Successfully created new account.`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Unable to create user.');
    } finally {
      setBusyId(null);
    }
  };

  const renderRoleBadge = (role: AdminUser['role']) => {
    switch (role) {
      case 'STUDENT':
        return (
          <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
            {locale === 'vi' ? 'SINH VIÊN' : 'STUDENT'}
          </span>
        );
      case 'LECTURER':
        return (
          <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
            {locale === 'vi' ? 'GIẢNG VIÊN' : 'LECTURER'}
          </span>
        );
      case 'ADMIN':
        return (
          <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
            {locale === 'vi' ? 'QUẢN TRỊ VIÊN' : 'ADMIN'}
          </span>
        );
      default:
        return <span>{role}</span>;
    }
  };

  const renderStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, border: '1px solid #a7f3d0' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
        {locale === 'vi' ? 'Hoạt động' : 'Active'}
      </span>
    ) : (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fef2f2', color: '#b91c1c', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, border: '1px solid #fecaca' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
        {locale === 'vi' ? 'Đã khóa' : 'Suspended'}
      </span>
    );
  };

  const totalUsersCount = overview?.users?.total || pagination?.total || 0;
  const studentsCount = overview?.users?.students || 0;
  const lecturersCount = overview?.users?.lecturers || 0;
  const adminsCount = Math.max(0, totalUsersCount - studentsCount - lecturersCount);

  return (
    <AdminShell active="users" title={t('admin.usersTitle')}>
      <AdminPageHeader
        eyebrow={t('admin.usersEyebrow')}
        title={t('admin.usersTitle')}
        description={t('admin.usersDesc')}
      />

      {/* Dismissible Feedback Message */}
      {message && (
        <div
          className="user-notice"
          style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
          role="status"
        >
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {error && (
        <div
          className="user-notice"
          style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}
          role="alert"
        >
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Filter Toolbar with Navigation Role Tabs */}
      <div className="student-filter-toolbar" style={{ marginBottom: '20px' }}>
        <div className="student-tabs-pills" role="tablist">
          <button
            type="button"
            className={`student-tab-pill ${roleTab === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setRoleTab('ALL');
              setPage(1);
            }}
          >
            {locale === 'vi' ? 'Tất cả tài khoản' : 'All Accounts'}{' '}
            {totalUsersCount > 0 && <span className="student-tab-pill__count">{totalUsersCount}</span>}
          </button>

          <button
            type="button"
            className={`student-tab-pill ${roleTab === 'STUDENT' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setRoleTab('STUDENT');
              setPage(1);
            }}
          >
            {locale === 'vi' ? 'Sinh viên' : 'Students'}{' '}
            {studentsCount > 0 && <span className="student-tab-pill__count">{studentsCount}</span>}
          </button>

          <button
            type="button"
            className={`student-tab-pill ${roleTab === 'LECTURER' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setRoleTab('LECTURER');
              setPage(1);
            }}
          >
            {locale === 'vi' ? 'Giảng viên' : 'Lecturers'}{' '}
            {lecturersCount > 0 && <span className="student-tab-pill__count">{lecturersCount}</span>}
          </button>

          <button
            type="button"
            className={`student-tab-pill ${roleTab === 'ADMIN' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setRoleTab('ADMIN');
              setPage(1);
            }}
          >
            {locale === 'vi' ? 'Quản trị viên' : 'Admins'}{' '}
            {adminsCount > 0 && <span className="student-tab-pill__count">{adminsCount}</span>}
          </button>
        </div>

        <div className="student-search-sort-group">
          {/* Search Box */}
          <div className="student-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder={locale === 'vi' ? 'Tìm tài khoản (tên, email, MSSV)...' : 'Search accounts...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="student-search-input"
              aria-label="Search users"
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

          {/* Active status dropdown */}
          <div className="student-sort-box">
            <span className="student-sort-label">{locale === 'vi' ? 'Trạng thái:' : 'Status:'}</span>
            <SortDropdown
              value={activeFilter}
              onChange={(val) => {
                setActiveFilter(val as ActiveFilter);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: locale === 'vi' ? 'Tất cả trạng thái' : 'All statuses' },
                { value: 'ACTIVE', label: locale === 'vi' ? 'Đang hoạt động' : 'Active' },
                { value: 'INACTIVE', label: locale === 'vi' ? 'Đã khóa' : 'Suspended' },
              ]}
            />
          </div>

          {/* Add User button */}
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            {locale === 'vi' ? '+ Thêm tài khoản' : '+ Add Account'}
          </Button>
        </div>
      </div>

      {/* SYSTEM ACCOUNTS TABLE */}
      <div className="admin-users-card">
        <div className="table-wrap">
          <table className="data-table admin-users-table">
            <thead>
              <tr>
                <th>{locale === 'vi' ? 'Tài khoản / Người dùng' : 'Account / User'}</th>
                <th>{locale === 'vi' ? 'Vai trò' : 'Role'}</th>
                <th>{locale === 'vi' ? 'MSSV / Khoa ngành' : 'Student ID / Major'}</th>
                <th>{locale === 'vi' ? 'Trạng thái' : 'Status'}</th>
                <th>{locale === 'vi' ? 'Ngày tham gia' : 'Joined'}</th>
                <th style={{ textAlign: 'right' }}>{locale === 'vi' ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={4} type="users" />
              ) : accounts.length > 0 ? (
                accounts.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {getUserInitials(user.name, user.email)}
                        </div>
                        <div className="admin-user-info">
                          <div className="admin-user-name">
                            {user.name || (locale === 'vi' ? 'Chưa đặt tên' : 'Unnamed User')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                            <span className="admin-user-email">{user.email}</span>
                            {user.phone && (
                              <span style={{ fontSize: '11.5px', color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px', fontWeight: 500, border: '1px solid #bae6fd' }}>
                                📞 {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderRoleBadge(user.role)}
                        {/* Role Switcher Dropdown */}
                        <div style={{ width: '130px' }}>
                          <SortDropdown
                            value={user.role}
                            onChange={(val) => handleChangeRole(user, val as AdminUser['role'])}
                            options={[
                              { value: 'STUDENT', label: locale === 'vi' ? 'Sinh viên' : 'Student' },
                              { value: 'LECTURER', label: locale === 'vi' ? 'Giảng viên' : 'Lecturer' },
                              { value: 'ADMIN', label: locale === 'vi' ? 'Quản trị viên' : 'Admin' },
                            ]}
                            disabled={busyId === user.id}
                            size="sm"
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {user.studentId && <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.studentId}</div>}
                        {user.major && <div style={{ fontSize: '12px', color: '#64748b' }}>{user.major}</div>}
                        {!user.studentId && !user.major && <span style={{ color: '#94a3b8' }}>—</span>}
                      </div>
                    </td>
                    <td>
                      {renderStatusBadge(user.isActive)}
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                          : locale === 'vi' ? 'Gần đây' : 'Recently'}
                      </span>
                    </td>
                    <td>
                      <div className="review-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          disabled={busyId === user.id}
                          onClick={() => handleToggleActive(user)}
                          style={{
                            fontSize: '12px',
                            padding: '5px 10px',
                            color: user.isActive ? '#b91c1c' : '#047857',
                            borderColor: user.isActive ? '#fecaca' : '#a7f3d0',
                            background: user.isActive ? '#fef2f2' : '#ecfdf5',
                          }}
                        >
                          {user.isActive ? (locale === 'vi' ? 'Khóa' : 'Suspend') : (locale === 'vi' ? 'Mở khóa' : 'Activate')}
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={busyId === user.id}
                          onClick={() => handleDeleteUser(user)}
                          style={{
                            fontSize: '12px',
                            padding: '5px 8px',
                            color: '#64748b',
                          }}
                          title={locale === 'vi' ? 'Xóa tài khoản' : 'Delete user'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                      {locale === 'vi' ? 'Không tìm thấy tài khoản nào' : 'No accounts found'}
                    </div>
                    <div style={{ fontSize: '12.5px' }}>
                      {locale === 'vi' ? 'Không có tài khoản nào phù hợp với bộ lọc hiện tại.' : 'No accounts matched the current criteria.'}
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
            aria-label="Pagination"
          >
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              {locale === 'vi' ? 'Trang' : 'Page'}{' '}
              <strong>{pagination.page}</strong> / <strong>{pagination.totalPages}</strong>
              {' · '}
              {pagination.total} {locale === 'vi' ? 'tài khoản' : 'accounts'}
            </span>
            <div className="review-actions">
              <Button
                variant="secondary"
                disabled={page <= 1 || loading}
                onClick={() => setPage((c) => Math.max(1, c - 1))}
              >
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

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="admin-modal-backdrop" onClick={() => !busyId && setIsCreateOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <div className="admin-modal-icon admin-modal-icon--primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <div>
                <h3 className="admin-modal-title">{locale === 'vi' ? 'Thêm tài khoản mới' : 'Add New Account'}</h3>
                <p className="admin-modal-subtitle">
                  {locale === 'vi' ? 'Tạo trực tiếp tài khoản người dùng vào hệ thống' : 'Create a new user account directly'}
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => !busyId && setIsCreateOpen(false)}
                aria-label="Close"
                disabled={Boolean(busyId)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="admin-modal-field">
                  <label className="admin-modal-label">
                    Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@hyperdata.org"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="admin-modal-input"
                  />
                </div>

                <div className="admin-modal-field">
                  <label className="admin-modal-label">
                    {locale === 'vi' ? 'Họ và tên' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={locale === 'vi' ? 'Nguyễn Văn A' : 'John Doe'}
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="admin-modal-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="admin-modal-field">
                    <label className="admin-modal-label">
                      {locale === 'vi' ? 'Vai trò' : 'Role'}
                    </label>
                    <div className="users-create-role-dropdown">
                      <SortDropdown
                        value={createForm.role}
                        onChange={(val) => setCreateForm({ ...createForm, role: val as AdminUser['role'] })}
                        options={[
                          { value: 'STUDENT', label: locale === 'vi' ? 'Sinh viên' : 'Student' },
                          { value: 'LECTURER', label: locale === 'vi' ? 'Giảng viên' : 'Lecturer' },
                          { value: 'ADMIN', label: locale === 'vi' ? 'Quản trị viên' : 'Admin' },
                        ]}
                        disabled={Boolean(busyId)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="admin-modal-field">
                    <label className="admin-modal-label">
                      {locale === 'vi' ? 'Mã sinh viên (nếu có)' : 'Student ID'}
                    </label>
                    <input
                      type="text"
                      placeholder="SE123456"
                      value={createForm.studentId}
                      onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                      className="admin-modal-input"
                    />
                  </div>
                </div>

                <div className="admin-modal-field">
                  <label className="admin-modal-label">
                    {locale === 'vi' ? 'Ngành / Khoa' : 'Major / Department'}
                  </label>
                  <input
                    type="text"
                    placeholder={locale === 'vi' ? 'Kỹ thuật phần mềm' : 'Software Engineering'}
                    value={createForm.major}
                    onChange={(e) => setCreateForm({ ...createForm, major: e.target.value })}
                    className="admin-modal-input"
                  />
                </div>

                <div className="admin-modal-field">
                  <label className="admin-modal-label" style={{ marginBottom: 4 }}>
                    {locale === 'vi' ? 'Mật khẩu khởi tạo' : 'Initial Password'}
                  </label>
                  <input
                    type="password"
                    placeholder={locale === 'vi' ? 'Để trống nếu tạo mật khẩu ngẫu nhiên' : 'Leave empty to auto-generate'}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="admin-modal-input"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-cancel"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={Boolean(busyId)}
                >
                  {locale === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="admin-btn-confirm admin-btn-confirm--primary"
                  disabled={Boolean(busyId)}
                >
                  {busyId ? (locale === 'vi' ? 'Đang tạo...' : 'Creating...') : (locale === 'vi' ? 'Tạo tài khoản' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom General Confirmation Modal */}
      {confirmModal && confirmModal.open && (
        <div className="admin-modal-backdrop" onClick={() => !busyId && setConfirmModal(null)}>
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div className={`admin-modal-icon ${confirmModal.isDanger ? 'admin-modal-icon--rejected' : 'admin-modal-icon--published'}`}>
                {confirmModal.isDanger ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="admin-modal-title">{confirmModal.title}</h3>
                <p className="admin-modal-subtitle">{confirmModal.description}</p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => !busyId && setConfirmModal(null)}
                aria-label="Close"
                disabled={Boolean(busyId)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-cancel"
                onClick={() => setConfirmModal(null)}
                disabled={Boolean(busyId)}
              >
                {confirmModal.cancelLabel}
              </button>
              <button
                type="button"
                className={`admin-btn-confirm ${confirmModal.isDanger ? 'admin-btn-confirm--rejected' : 'admin-btn-confirm--published'}`}
                onClick={() => confirmModal.onConfirm()}
                disabled={Boolean(busyId)}
              >
                {busyId ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                    {locale === 'vi' ? 'Đang xử lý...' : 'Processing...'}
                  </>
                ) : (
                  confirmModal.confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default AdminUsersView;
