'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks';

interface ManuscriptItem {
  id: string;
  code: string;
  title: string;
  author: string;
  field: string;
  status: 'reviewing' | 'revision' | 'completed';
  statusText: string;
  version: string;
  date: string;
}

const MANUSCRIPTS: ManuscriptItem[] = [
  {
    id: 'm1',
    code: '#014',
    title: 'Mapping Data Literacy in Emerging Research Environments',
    author: 'Nguyễn Minh An',
    field: 'Computer Science',
    status: 'reviewing',
    statusText: 'Đang phản biện',
    version: 'Version 2',
    date: '12/09/2026',
  },
  {
    id: 'm2',
    code: '#013',
    title: 'Reproducible Computational Workflows for Academic Labs',
    author: 'Trần Gia Huy',
    field: 'Information Systems',
    status: 'revision',
    statusText: 'Chờ chỉnh sửa',
    version: 'Version 1',
    date: '10/09/2026',
  },
  {
    id: 'm3',
    code: '#012',
    title: 'Peer Review Practices & Algorithmic Transparency',
    author: 'Lê Hà My',
    field: 'Biotechnology & Health',
    status: 'completed',
    statusText: 'Đã hoàn tất',
    version: 'Version 3',
    date: '08/09/2026',
  },
  {
    id: 'm4',
    code: '#011',
    title: 'Adaptive Edge AI for Real-time Traffic Graph Analytics',
    author: 'Trần Thu Hà',
    field: 'Software Engineering',
    status: 'completed',
    statusText: 'Đã hoàn tất',
    version: 'Version 2',
    date: '05/09/2026',
  },
];

export default function PublicPreprintLanding() {
  const { user } = useAuth();

  return (
    <div className="slrs-layout">
      {/* 1. TOP NAVBAR */}
      <header className="slrs-navbar">
        <div className="slrs-container slrs-navbar__inner">
          <Link href="/" className="slrs-brand" aria-label="Hyperdata Lab Preprint System">
            <div className="slrs-brand__logo">
              <span className="slrs-brand__letters">
                P R E P R I N <span className="slrs-brand__accent">T</span>
              </span>
              <span className="slrs-brand__sub">
                HYPERDATA LAB · PREPRINT REPOSITORY SYSTEM
              </span>
            </div>
          </Link>

          <nav className="slrs-nav" aria-label="Chuyên mục chính">
            <a href="#projects" className="slrs-nav__link">PROJECTS</a>
            <a href="#process" className="slrs-nav__link">PROCESS</a>
            <a href="#guidelines" className="slrs-nav__link">GUIDELINES</a>
          </nav>

          <div className="slrs-navbar__action">
            {user ? (
              <Link href="/student" className="slrs-btn-signin">
                ACCOUNT
              </Link>
            ) : (
              <Link href="/api/auth/login" className="slrs-btn-signin">
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="slrs-hero">
        <div className="slrs-container slrs-hero__inner">
          <div className="slrs-hero__eyebrow">
            HYPERDATA LAB · PREPRINT PROGRAM 2026
          </div>

          <h1 className="slrs-hero__title">
            Empowering <br />
            <em>Research Excellence</em>
          </h1>

          <p className="slrs-hero__lead">
            A comprehensive platform for student researchers to conduct peer review, establish cryptographic precedence with SHA-256 timestamping, and foster academic rigor before external publication.
          </p>

          <div className="slrs-hero__actions">
            <Link
              href={user ? '/student/my-preprints/new' : '/api/auth/login'}
              className="slrs-btn slrs-btn--dark"
            >
              MANAGE PROJECTS
            </Link>
            <a href="#process" className="slrs-btn slrs-btn--outline">
              EXPLORE PROCESS
            </a>
          </div>

          {/* 3. HERO VISUALIZATION WORKFLOW BOX */}
          <div id="process" className="slrs-viz-box">
            <div className="slrs-viz-grid">
              <div className="slrs-viz-card">
                <span className="slrs-viz-card__num">01</span>
                <h3 className="slrs-viz-card__title">Đăng Ký &amp; Nộp Sơ Bộ</h3>
                <p className="slrs-viz-card__desc">
                  Nộp bản thảo PDF (v1.0). Hệ thống tự động cấp mã băm SHA-256 xác lập quyền ưu tiên nghiên cứu.
                </p>
                <div className="slrs-viz-card__date">20/08 — 20/09/2026</div>
              </div>

              <div className="slrs-viz-card slrs-viz-card--active">
                <div className="slrs-viz-card__badge">Đang diễn ra</div>
                <span className="slrs-viz-card__num">02</span>
                <h3 className="slrs-viz-card__title">Mentor Phản Biện</h3>
                <p className="slrs-viz-card__desc">
                  Giảng viên hướng dẫn trong Lab phản biện phương pháp luận, mô hình tính toán và độ tin cậy dữ liệu.
                </p>
                <div className="slrs-viz-card__date">21/09 — 30/09/2026</div>
              </div>

              <div className="slrs-viz-card">
                <span className="slrs-viz-card__num">03</span>
                <h3 className="slrs-viz-card__title">Tác Giả Hoàn Thiện</h3>
                <p className="slrs-viz-card__desc">
                  Nhóm sinh viên thực hiện Rebuttal, giải trình từng góp ý phản biện và cập nhật bản phát hành v2.0.
                </p>
                <div className="slrs-viz-card__date">01/10 — 15/10/2026</div>
              </div>

              <div className="slrs-viz-card">
                <span className="slrs-viz-card__num">04</span>
                <h3 className="slrs-viz-card__title">Nghiệm Thu &amp; Cấp DOI</h3>
                <p className="slrs-viz-card__desc">
                  Hội đồng chấm điểm theo thang 100đ, công nhận kết quả nghiệm thu và cấp mã DOI lưu chiểu vĩnh viễn.
                </p>
                <div className="slrs-viz-card__date">20/10 — 25/10/2026</div>
              </div>
            </div>

            <div className="slrs-viz-box__caption">
              STANDARDIZED PREPRINT 2026 WORKFLOW VISUALIZATION
            </div>
          </div>
        </div>
      </section>

      {/* 4. NOTICES & CRITICAL MILESTONES */}
      <section className="slrs-section slrs-section--bordered">
        <div className="slrs-container">
          <div className="slrs-section-head">
            <span className="slrs-label">TIMELINE &amp; CRITICAL MILESTONES</span>
            <h2 className="slrs-heading">Kế Hoạch Xét Duyệt Đợt 01/2026</h2>
            <p className="slrs-subheading">
              Các mốc thời gian quy định nghiêm ngặt để đảm bảo tính minh bạch và tiến độ phản biện học thuật.
            </p>
          </div>

          <div className="slrs-milestones-grid">
            <div className="slrs-milestone-card">
              <div className="slrs-milestone-card__dot" />
              <div className="slrs-milestone-card__content">
                <span className="slrs-milestone-card__date">15/10/2026</span>
                <h3 className="slrs-milestone-card__title">Hạn Cuối Nộp Bản Thảo</h3>
                <p className="slrs-milestone-card__desc">
                  Khóa cổng tiếp nhận hồ sơ sơ bộ Đợt 01. Toàn bộ bản thảo được cấp dấu băm mật mã thời gian.
                </p>
              </div>
            </div>

            <div className="slrs-milestone-card">
              <div className="slrs-milestone-card__dot" />
              <div className="slrs-milestone-card__content">
                <span className="slrs-milestone-card__date">20/10/2026</span>
                <h3 className="slrs-milestone-card__title">Bắt Đầu Phản Biện Chuyên Môn</h3>
                <p className="slrs-milestone-card__desc">
                  Hội đồng Giảng viên thẩm định độc lập phương pháp nghiên cứu và trả kết quả phản biện chi tiết.
                </p>
              </div>
            </div>

            <div className="slrs-milestone-card">
              <div className="slrs-milestone-card__dot" />
              <div className="slrs-milestone-card__content">
                <span className="slrs-milestone-card__date">15/11/2026</span>
                <h3 className="slrs-milestone-card__title">Hạn Cuối Chỉnh Sửa &amp; Rebuttal</h3>
                <p className="slrs-milestone-card__desc">
                  Tác giả hoàn thiện phiên bản chỉnh sửa, đính kèm văn bản giải trình đối chiếu ý kiến chuyên gia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACTIVE MANUSCRIPTS REPOSITORY */}
      <section id="projects" className="slrs-section">
        <div className="slrs-container">
          <div className="slrs-section-head">
            <span className="slrs-label">PUBLIC REPOSITORY</span>
            <h2 className="slrs-heading">Bản Thảo Nghiên Cứu Trong Đợt</h2>
            <p className="slrs-subheading">
              Theo dõi trực tiếp tình trạng lưu chiểu, tiến độ phản biện và phân bổ phiên bản của từng đề tài.
            </p>
          </div>

          <div className="slrs-manuscripts-list">
            {MANUSCRIPTS.map((item) => (
              <div key={item.id} className="slrs-manuscript-card">
                <div className="slrs-manuscript-card__left">
                  <span className="slrs-manuscript-code">{item.code}</span>
                  <div className="slrs-manuscript-main">
                    <Link href="/student/my-preprints" className="slrs-manuscript-title">
                      {item.title}
                    </Link>
                    <div className="slrs-manuscript-meta">
                      <span className="slrs-author">{item.author}</span>
                      <span className="slrs-meta-sep">•</span>
                      <span className="slrs-field">{item.field}</span>
                    </div>
                  </div>
                </div>

                <div className="slrs-manuscript-card__right">
                  <span className={`slrs-pill slrs-pill--${item.status}`}>
                    {item.statusText}
                  </span>
                  <span className="slrs-version-tag">{item.version}</span>
                  <span className="slrs-date-tag">{item.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="slrs-view-all">
            <Link href="/student/my-preprints" className="slrs-view-all__link">
              XEM TẤT CẢ BẢN THẢO <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. DARK QUOTE SECTION (EXACT FROM SLRS) */}
      <section className="slrs-quote-section">
        <div className="slrs-container">
          <div className="slrs-quote-box">
            <h2 className="slrs-quote-box__title">
              Engineered for <br />
              <em>Academic Rigor</em>
            </h2>
            <p className="slrs-quote-box__text">
              &ldquo;Transparency, open methodology, and verified precedence are the twin pillars of scientific credibility. Hyperdata Preprint provides the digital scaffolding to uphold and advance them.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* 7. SCHOLAR TOOLKIT & GUIDELINES */}
      <section id="guidelines" className="slrs-section">
        <div className="slrs-container">
          <div className="slrs-section-head">
            <span className="slrs-label">SCHOLAR TOOLKIT</span>
            <h2 className="slrs-heading">Quy Chuẩn &amp; Tài Liệu Tác Giả</h2>
            <p className="slrs-subheading">
              Bộ công cụ chuẩn mực hỗ trợ sinh viên chuẩn bị bản thảo đạt tiêu chuẩn hội nghị và tạp chí quốc tế.
            </p>
          </div>

          <div className="slrs-toolkit-grid">
            <Link href="/student/my-preprints/new" className="slrs-toolkit-card">
              <div className="slrs-toolkit-card__icon">📖</div>
              <h3 className="slrs-toolkit-card__title">Hướng Dẫn Nộp Bản Thảo</h3>
              <p className="slrs-toolkit-card__desc">
                Quy định cấu trúc bản thảo khoa học, yêu cầu tóm tắt (Abstract) và mã nguồn mở đi kèm.
              </p>
            </Link>

            <Link href="/student/versions" className="slrs-toolkit-card">
              <div className="slrs-toolkit-card__icon">⚖️</div>
              <h3 className="slrs-toolkit-card__title">Quy Trình &amp; Tiêu Chí Phản Biện</h3>
              <p className="slrs-toolkit-card__desc">
                Thang điểm 100đ đánh giá tính mới, phương pháp luận thực nghiệm và khả năng tái lập.
              </p>
            </Link>

            <Link href="/student/my-preprints/new" className="slrs-toolkit-card">
              <div className="slrs-toolkit-card__icon">📄</div>
              <h3 className="slrs-toolkit-card__title">Mẫu Đề Cương (LaTeX / Word)</h3>
              <p className="slrs-toolkit-card__desc">
                Template chuẩn IEEE/ACM hai cột tích hợp sẵn định dạng trích dẫn BibTeX chuẩn mực.
              </p>
            </Link>

            <a href="#projects" className="slrs-toolkit-card">
              <div className="slrs-toolkit-card__icon">🛡️</div>
              <h3 className="slrs-toolkit-card__title">Liêm Chính Học Thuật &amp; DOI</h3>
              <p className="slrs-toolkit-card__desc">
                Cơ chế tạo chuỗi dấu thời gian SHA-256 chống chiếm đoạt ý tưởng trước ngày nghiệm thu.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* 8. SLRS FOOTER */}
      <footer className="slrs-footer">
        <div className="slrs-container slrs-footer__inner">
          <div className="slrs-footer__left">
            <span className="slrs-footer__brand">
              P R E P R I N <span className="slrs-brand__accent">T</span>
            </span>
            <span className="slrs-footer__desc">
              Hyperdata Lab · Student Research Initiative
            </span>
          </div>

          <div className="slrs-footer__right">
            <span>© {new Date().getFullYear()} Hyperdata Lab. All rights reserved. Lưu hành nội bộ.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
