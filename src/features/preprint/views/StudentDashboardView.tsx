'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks';
import { StudentDashboardLayout } from '../components';
import { Skeleton, TableSkeleton } from '@/components/skeleton';
import { usePreprintList } from '../hooks';
import type { PreprintStatus } from '@/shared/types';
import { useTranslation } from '@/i18n';

export function StudentDashboardView() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const displayName = user?.name || user?.email || 'Scholar';
  const { items, loading, error } = usePreprintList();
  const [filterStatus, setFilterStatus] = useState<'ALL' | PreprintStatus>('ALL');
  // Metrics calculation
  const metrics = useMemo(() => {
    const total = items.length;
    const underReview = items.filter((i) => i.status === 'UNDER_REVIEW').length;
    const needsRevision = items.filter((i) => i.status === 'NEEDS_REVISION').length;
    const approved = items.filter((i) => i.status === 'APPROVED' || i.status === 'PUBLISHED').length;
    return { total, underReview, needsRevision, approved };
  }, [items]);

  // Needs revision item
  const revisionItem = useMemo(() => {
    return items.find((i) => i.status === 'NEEDS_REVISION');
  }, [items]);

  // Filtered list for the dashboard table
  const displayedItems = useMemo(() => {
    if (filterStatus === 'ALL') return items;
    return items.filter((i) => i.status === filterStatus);
  }, [items, filterStatus]);

  return (
    <StudentDashboardLayout
      title={t('student.topbar.academicDashboard')}
      revisionCount={metrics.needsRevision}
      totalCount={metrics.total}
    >

      {/* Urgent Action Alert (Revision Required) */}

      {revisionItem && (
        <div className="dashboard-alert-banner">
          <div className="dashboard-alert-banner__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="dashboard-alert-banner__content">
            <div className="dashboard-alert-banner__header">
              <strong className="dashboard-alert-banner__title">Hành động khẩn: Yêu cầu chỉnh sửa</strong>
              <span className="dashboard-alert-banner__badge">Phiên bản {revisionItem.current_version}</span>
            </div>
            <p className="dashboard-alert-banner__desc">
              Giảng viên hướng dẫn <strong>{revisionItem.reviews?.[0]?.reviewer_name || 'Người thẩm định'}</strong> đã gửi nhận xét và yêu cầu cập nhật bản thảo <em>&ldquo;{revisionItem.title}&rdquo;</em>.
            </p>
          </div>
          <div className="dashboard-alert-banner__action">
            <Link
              href={`/student/my-preprints/${revisionItem.id}?tab=reviews`}
              className="dashboard-alert-banner__btn"
            >
              Xem nhận xét &amp; Chỉnh sửa →
            </Link>
          </div>
        </div>
      )}

      {/* 3. Key Performance Metric Cards */}
      <div className="dashboard-metrics-grid">
        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Tổng số bản thảo</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{loading ? <Skeleton width={32} height={28} style={{ display: 'inline-block' }} /> : metrics.total}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--neutral">
            <span>Đã đăng ký trong kho lưu trữ</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Đang thẩm định</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--sky">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{loading ? <Skeleton width={32} height={28} style={{ display: 'inline-block' }} /> : metrics.underReview}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--sky">
            <span>Đang trong quy trình đánh giá</span>
          </div>
        </div>

        <div className="dashboard-metric-card dashboard-metric-card--alert">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Cần chỉnh sửa</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{loading ? <Skeleton width={32} height={28} style={{ display: 'inline-block' }} /> : metrics.needsRevision}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--amber">
            <span>Đang chờ sinh viên phản hồi</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Đã duyệt</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{loading ? <Skeleton width={32} height={28} style={{ display: 'inline-block' }} /> : metrics.approved}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--green">
            <span>Sẵn sàng lưu trữ / Công khai</span>
          </div>
        </div>
      </div>

      {/* 4. Full-Width Recent Manuscripts Section */}
      <div className="dashboard-card">
        <div className="dashboard-card__header">
          <div>
            <h2 className="dashboard-card__title">Bản thảo gần đây</h2>
            <p className="dashboard-card__desc">Theo dõi tiến trình nộp bản thảo và xác thực mật mã</p>
          </div>
          <div className="dashboard-card__filters">
            <button
              type="button"
              className={`dashboard-filter-btn ${filterStatus === 'ALL' ? 'dashboard-filter-btn--active' : ''}`}
              onClick={() => setFilterStatus('ALL')}
            >
              Tất cả ({metrics.total})
            </button>
            <button
              type="button"
              className={`dashboard-filter-btn ${filterStatus === 'NEEDS_REVISION' ? 'dashboard-filter-btn--active' : ''}`}
              onClick={() => setFilterStatus('NEEDS_REVISION')}
            >
              Cần chỉnh sửa ({metrics.needsRevision})
            </button>
            <button
              type="button"
              className={`dashboard-filter-btn ${filterStatus === 'UNDER_REVIEW' ? 'dashboard-filter-btn--active' : ''}`}
              onClick={() => setFilterStatus('UNDER_REVIEW')}
            >
              Đang thẩm định ({metrics.underReview})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table dashboard-table--repository">
              <thead>
                <tr>
                  <th style={{ width: '48%' }}>Bản thảo</th>
                  <th>Lĩnh vực nghiên cứu</th>
                  <th>Phiên bản</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton rows={4} type="submissions" />
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="dashboard-error">Lỗi: {error.message}</div>
        ) : displayedItems.length === 0 ? (
          <div className="dashboard-empty">Không tìm thấy bản thảo nào cho bộ lọc này.</div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table dashboard-table--repository">
              <thead>
                <tr>
                  <th style={{ width: '48%' }}>Bản thảo</th>
                  <th>Lĩnh vực nghiên cứu</th>
                  <th>Phiên bản</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item) => (
                  <tr key={item.id}>
                    <td className="dashboard-table__title-cell">
                      <div className="dashboard-table__title-group">
                        <Link href={`/student/my-preprints/${item.id}`} className="dashboard-table__title-link">
                          {item.title}
                        </Link>
                        {item.is_private && (
                          <span className="dashboard-private-pill">Riêng tư</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="dashboard-badge-tag">{item.discipline || 'Tổng quát'}</span>
                    </td>
                    <td>
                      <span className="dashboard-version-pill">v{item.current_version}</span>
                    </td>
                    <td>
                      {item.status === 'NEEDS_REVISION' && (
                        <span className="user-badge user-badge--revision">CẦN CHỈNH SỬA</span>
                      )}
                      {item.status === 'UNDER_REVIEW' && (
                        <span className="user-badge user-badge--review">ĐANG THẨM ĐỊNH</span>
                      )}
                      {item.status === 'PUBLISHED' && (
                        <span className="user-badge user-badge--approved">ĐÃ XUẤT BẢN</span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="user-badge user-badge--approved">ĐÃ DUYỆT</span>
                      )}
                      {item.status === 'DRAFT' && (
                        <span className="user-badge user-badge--draft">BẢN NHÁP</span>
                      )}
                      {(item.status === 'REJECTED' || item.status === 'WITHDRAWN') && (
                        <span className="user-badge user-badge--withdrawn">ĐÃ TỪ CHỐI</span>
                      )}
                    </td>
                    <td className="dashboard-table__date">
                      {(() => {
                        if (!item.updated_at) return '—';
                        const d = new Date(item.updated_at);
                        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="dashboard-card__footer">
          <Link href="/student/my-preprints" className="dashboard-card__view-all">
            Xem toàn bộ bản thảo trong kho lưu trữ →
          </Link>
        </div>
      </div>

      {/* 5. Bottom Widgets: Faculty Advisory Activity & Guidance */}
      <div className="dashboard-widgets-grid">
        {/* Faculty Review Feedback Feed */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Hoạt động hướng dẫn của GVHD</h2>
          </div>
          <div className="dashboard-mentor-list">
            <div className="dashboard-mentor-item">
              <div className="dashboard-mentor-avatar">LT</div>
              <div className="dashboard-mentor-content">
                <div className="dashboard-mentor-top">
                  <strong>{revisionItem?.reviews?.[0]?.reviewer_name || 'Chưa có hoạt động phản biện'}</strong>
                  <span className="dashboard-mentor-badge">Tải từ API bản thảo</span>
                </div>
                <p className="dashboard-mentor-comment">
                  {revisionItem?.reviews?.[0]?.comments || 'Chưa có nhận xét phản biện nào được ghi nhận.'}
                </p>
                <div className="dashboard-mentor-meta">
                  <span>{revisionItem?.title || 'Không có hoạt động phản biện bản thảo'}</span>
                  <Link href="/student/mentor-feedback" className="dashboard-mentor-link">
                    Xem phản hồi
                  </Link>
                </div>
              </div>
            </div>

            <div className="dashboard-mentor-item">
              <div className="dashboard-mentor-avatar dashboard-mentor-avatar--purple">NT</div>
              <div className="dashboard-mentor-content">
                <div className="dashboard-mentor-top">
                  <strong>Phân công người phản biện</strong>
                  <span className="dashboard-mentor-badge dashboard-mentor-badge--neutral">API bản thảo</span>
                </div>
                <p className="dashboard-mentor-comment">
                  Việc phân công và khuyến nghị của người phản biện được quản lý trong không gian quản trị.
                </p>
                <div className="dashboard-mentor-meta">
                  <span>Các phân công phản biện được tải tự động từ hệ thống.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Guidance Card */}
        <div className="dashboard-card dashboard-card--accent">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Hướng dẫn nộp bản thảo</h2>
          </div>
          <div className="dashboard-milestones">
            <div className="dashboard-milestone-item">
              <div className="dashboard-milestone-info">
                <strong>Chuẩn bị bản thảo của bạn</strong>
                <p>Tải lên tệp PDF, kiểm tra dữ liệu bản thảo và gửi để giảng viên hướng dẫn đánh giá.</p>
              </div>
            </div>
            <div className="dashboard-milestone-item">
              <div className="dashboard-milestone-info">
                <strong>Theo dõi kết quả đánh giá</strong>
                <p>Giảng viên gửi các ý kiến và đề xuất; chỉ quản trị viên mới có quyền phát hành chính thức preprint.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export const PreprintDashboardView = StudentDashboardView;
export default StudentDashboardView;
