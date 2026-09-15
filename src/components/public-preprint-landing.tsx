import Link from 'next/link';
import { HyperdataLogo } from './hyperdata-logo';
import { PublicPortalShowcase } from './public-portal-showcase';
import { ScrollRevealObserver } from './scroll-reveal';

export default function PublicPreprintLanding() {
  return (
    <div className="public-landing">
      <ScrollRevealObserver />

      {/* Modern Sticky Glassmorphism Header */}
      <header className="pl-header">
        <div className="pl-container pl-header__inner">
          <Link href="/" className="pl-brand" aria-label="Hyperdata Lab Home">
            <HyperdataLogo size={34} />
          </Link>

          <nav className="pl-nav" aria-label="Main Navigation">
            <a href="#portal" className="pl-nav__link">Portal</a>
            <a href="#features" className="pl-nav__link">Features</a>
            <a href="#advisory" className="pl-nav__link">Advisory</a>
            <a href="#faq" className="pl-nav__link">FAQ</a>
          </nav>

          <div className="pl-header__actions">
            <Link href="/api/auth/login" className="pl-btn pl-btn--ghost">
              Sign in
            </Link>
            <Link href="/register" className="pl-btn pl-btn--primary pl-btn--shimmer">
              <span>Create account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Centered Hero Section */}
      <section className="pl-section pl-hero pl-hero--centered">
        <div className="pl-container">
          {/* Centered Header Box */}
          <div className="pl-hero__center-box pl-reveal">
            <div className="pl-pill-badge">
              <span className="pl-pill-badge__icon" aria-hidden="true">🎓</span>
              <span>A transparent pathway for student research</span>
            </div>

            <h1 className="pl-hero__title pl-hero__title--centered">
              Discover research that{' '}
              <span className="pl-hero__highlight">moves your ideas forward.</span>
            </h1>

            <p className="pl-hero__desc pl-hero__desc--centered">
              Hyperdata Lab Preprint connects student scholars with university faculty.
              Timestamp your findings early, receive structured mentorship, and build an authentic scholarly portfolio.
            </p>

            <div className="pl-hero__actions pl-hero__actions--centered">
              <Link href="/register" className="pl-btn pl-btn--primary pl-btn--lg pl-btn--shimmer">
                <span>Create a student account</span>
                <span className="pl-btn__arrow" aria-hidden="true">→</span>
              </Link>
              <Link href="/api/auth/login" className="pl-btn pl-btn--secondary pl-btn--lg">
                Sign in with SSO
              </Link>
            </div>
          </div>

          {/* Layered Showcase Mockup */}
          <div id="portal" className="pl-hero__showcase-wrap pl-reveal" style={{ '--delay': '120ms' } as React.CSSProperties}>
            <PublicPortalShowcase />
          </div>

          {/* 3 Bento Feature Cards */}
          <div id="features" className="pl-bento-grid">
            <div className="pl-bento-card pl-reveal" style={{ '--delay': '0ms' } as React.CSSProperties}>
              <div className="pl-bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="pl-bento-title">Prepare & Timestamp</h3>
              <p className="pl-bento-desc">
                Register early manuscripts with immutable cryptographic records, securing your scientific priority without journal delays.
              </p>
              <Link href="/register" className="pl-bento-link">
                <span>Start submission</span>
                <span className="pl-bento-link__arrow" aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="pl-bento-card pl-reveal" style={{ '--delay': '120ms' } as React.CSSProperties}>
              <div className="pl-bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="pl-bento-title">Faculty Mentorship</h3>
              <p className="pl-bento-desc">
                Receive targeted methodological critiques and line-by-line guidance from university educators to strengthen your paper.
              </p>
              <a href="#advisory" className="pl-bento-link">
                <span>Explore mentorship</span>
                <span className="pl-bento-link__arrow" aria-hidden="true">→</span>
              </a>
            </div>

            <div className="pl-bento-card pl-reveal" style={{ '--delay': '240ms' } as React.CSSProperties}>
              <div className="pl-bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="pl-bento-title">Editorial Governance</h3>
              <p className="pl-bento-desc">
                Maintain a clear distinction between preprints and published articles, backed by institutional administrative oversight.
              </p>
              <a href="#faq" className="pl-bento-link">
                <span>Learn in FAQ</span>
                <span className="pl-bento-link__arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Academic Trust & Community Banner */}
          <div id="advisory" className="pl-trust-banner pl-reveal">
            <div className="pl-trust-quote">
              <div className="pl-trust-avatar" aria-hidden="true">🎓</div>
              <div>
                <p className="pl-trust-text">
                  &ldquo;Hyperdata Lab gives our student researchers a transparent, structured gateway to timestamp early findings and iterate with faculty.&rdquo;
                </p>
                <span className="pl-trust-author">Faculty Advisory Board • Student Research Initiative</span>
              </div>
            </div>
            <div className="pl-trust-labels">
              <span className="pl-trust-label-head">ACADEMIC DISCIPLINES</span>
              <div className="pl-trust-tags">
                <span>Computer Science</span>
                <span>Data Science</span>
                <span>Biotechnology</span>
                <span>Applied Physics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Footer FAQ Section */}
      <section id="faq" className="pl-section pl-section--alt pl-faq-prefooter pl-reveal">
        <div className="pl-container pl-container--narrow">
          <div className="pl-section-head">
            <span className="pl-eyebrow">Knowledge</span>
            <h2 className="pl-section-title">Frequently Asked Questions</h2>
            <p className="pl-section-subtitle">
              Everything you need to know about student preprints, faculty review, and academic priority.
            </p>
          </div>

          <div className="pl-faq-list">
            <details className="pl-faq-item" open>
              <summary className="pl-faq-question">
                <span>What is a preprint and does it prevent formal journal publication?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                A preprint is an author-owned preliminary manuscript shared before formal peer review. Major
                publishers (including IEEE, Elsevier, Springer Nature, and ACM) allow preprint sharing before submission.
                It establishes your scientific priority without forfeiting journal publication rights.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>Who can register and submit manuscripts to Hyperdata Lab Preprint?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                Hyperdata Lab Preprint is open to undergraduate and graduate students, academic researchers,
                and faculty. Registration is centrally managed through our university Single Sign-On (SSO) service.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>Can I update my manuscript after uploading it?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                Yes. Research is iterative. When lecturers provide critique or you improve your findings,
                you can submit revised versions (e.g. v2.0). All previous versions remain chronologically preserved in your
                audit timeline to maintain an honest academic record.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>How are preprints reviewed and approved?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                Submissions are assigned to qualified faculty lecturers who review manuscript clarity,
                methodology, and research relevance. Lecturers provide revision notes or recommend approval, while
                final publication readiness is validated by administrators.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>Is there any cost to submit or read preprints?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                No. Hyperdata Lab Preprint is completely free for students, researchers, and educators. Our mission
                is open scientific transparency without financial barriers.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="pl-footer">
        <div className="pl-container pl-footer__inner">
          <div className="pl-footer__brand">
            <HyperdataLogo size={32} />
            <p className="pl-footer__tagline">
              Open academic infrastructure supporting early research, faculty mentorship, and scholarly transparency.
            </p>
          </div>

          <div className="pl-footer__links">
            <div className="pl-footer__col">
              <h4>Platform</h4>
              <a href="#portal" className="pl-link">Preprint Portal</a>
              <a href="#features" className="pl-link">Core Features</a>
              <a href="#advisory" className="pl-link">Faculty Advisory</a>
            </div>
            <div className="pl-footer__col">
              <h4>Resources</h4>
              <a href="#faq" className="pl-link">FAQ & Guidelines</a>
              <Link href="/api/auth/login" className="pl-link">Faculty SSO Portal</Link>
              <Link href="/register" className="pl-link">Student Registration</Link>
            </div>
            <div className="pl-footer__col">
              <h4>Access</h4>
              <Link href="/register" className="pl-link">Create Account</Link>
              <Link href="/api/auth/login" className="pl-link">Sign In</Link>
              <Link href="/admin/dashboard" className="pl-link">Admin Dashboard</Link>
            </div>
          </div>
        </div>

        <div className="pl-container pl-footer__bottom">
          <p>© {new Date().getFullYear()} Hyperdata Lab. All rights reserved.</p>
          <p className="pl-footer__disclaimer">
            Hyperdata Lab Preprint is an educational research platform. Manuscripts are author-owned preliminary works.
          </p>
        </div>
      </footer>
    </div>
  );
}
