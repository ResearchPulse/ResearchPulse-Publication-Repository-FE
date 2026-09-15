import Link from 'next/link';
import { HyperdataLogo } from './hyperdata-logo';
import { PublicPortalShowcase } from './public-portal-showcase';

export default function PublicPreprintLanding() {
  return (
    <div className="public-landing">
      {/* Top Banner / Header */}
      <header className="pl-header">
        <div className="pl-container pl-header__inner">
          <Link href="/" className="pl-brand" aria-label="Hyperdata Lab Preprint Home">
            <HyperdataLogo size={36} />
            <span className="pl-brand__badge">Preprint</span>
          </Link>

          <nav className="pl-nav" aria-label="Main Navigation">
            <a href="#how-it-works" className="pl-nav__link">How it works</a>
            <a href="#why-preprint" className="pl-nav__link">Why preprint</a>
            <a href="#integrity" className="pl-nav__link">Academic integrity</a>
            <a href="#roles" className="pl-nav__link">Roles</a>
            <a href="#faq" className="pl-nav__link">FAQ</a>
          </nav>

          <div className="pl-header__actions">
            <Link href="/api/auth/login" className="pl-btn pl-btn--ghost">
              Sign in
            </Link>
            <Link href="/register" className="pl-btn pl-btn--primary">
              Create a student account
            </Link>
          </div>
        </div>
      </header>

      {/* Centered Hero Section */}
      <section className="pl-section pl-hero pl-hero--centered">
        <div className="pl-container">
          {/* Centered Header Box */}
          <div className="pl-hero__center-box">
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
              <Link href="/register" className="pl-btn pl-btn--primary pl-btn--lg">
                Create a student account
              </Link>
              <Link href="/api/auth/login" className="pl-btn pl-btn--secondary pl-btn--lg">
                Sign in with SSO
              </Link>
            </div>
          </div>

          {/* Layered Showcase Mockup */}
          <div className="pl-hero__showcase-wrap">
            <PublicPortalShowcase />
          </div>

          {/* 3 Bento Feature Cards */}
          <div className="pl-bento-grid">
            <div className="pl-bento-card">
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
              <a href="#why-preprint" className="pl-bento-link">Learn more →</a>
            </div>

            <div className="pl-bento-card">
              <div className="pl-bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="pl-bento-title">Faculty Mentorship</h3>
              <p className="pl-bento-desc">
                Receive targeted methodological critiques and line-by-line guidance from university educators to strengthen your paper.
              </p>
              <a href="#how-it-works" className="pl-bento-link">Learn more →</a>
            </div>

            <div className="pl-bento-card">
              <div className="pl-bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="pl-bento-title">Editorial Governance</h3>
              <p className="pl-bento-desc">
                Maintain a clear distinction between preprints and published articles, backed by institutional administrative oversight.
              </p>
              <a href="#integrity" className="pl-bento-link">Learn more →</a>
            </div>
          </div>

          {/* Academic Trust & Community Banner */}
          <div className="pl-trust-banner">
            <div className="pl-trust-quote">
              <div className="pl-trust-avatar">🎓</div>
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

      {/* Why start with a preprint */}
      <section id="why-preprint" className="pl-section pl-section--alt">
        <div className="pl-container">
          <div className="pl-section-head">
            <span className="pl-eyebrow">Foundation</span>
            <h2 className="pl-section-title">Why start with a preprint?</h2>
            <p className="pl-section-subtitle">
              Publishing formal journal papers can take months or years. A preprint secures your findings
              early while establishing open, constructive collaboration.
            </p>
          </div>

          <div className="pl-grid pl-grid--3">
            <div className="pl-card">
              <div className="pl-card__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="pl-card__title">Timestamp Your Discovery</h3>
              <p className="pl-card__text">
                Establish academic priority for your ideas. Submitting early creates a verifiably timestamped
                record that protects your scholarly contribution.
              </p>
            </div>

            <div className="pl-card">
              <div className="pl-card__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="pl-card__title">Receive Structured Guidance</h3>
              <p className="pl-card__text">
                Assigned lecturers provide actionable feedback on methodology, literature references,
                and analysis to refine your manuscript before final submission.
              </p>
            </div>

            <div className="pl-card">
              <div className="pl-card__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="pl-card__title">Transparent Research Record</h3>
              <p className="pl-card__text">
                Track every iteration from initial draft (v1) through revisions (v2, v3). Showcase your
                growth and research evolution with a clean audit timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="pl-section">
        <div className="pl-container">
          <div className="pl-section-head">
            <span className="pl-eyebrow">Process</span>
            <h2 className="pl-section-title">How the preprint pathway works</h2>
            <p className="pl-section-subtitle">
              A transparent, four-step lifecycle connecting student authors with university educators.
            </p>
          </div>

          <div className="pl-steps-grid">
            <div className="pl-step">
              <div className="pl-step__num">01</div>
              <h3 className="pl-step__title">Prepare Manuscript</h3>
              <p className="pl-step__text">
                Draft your research paper with standard academic sections: abstract, methodology,
                findings, and references. Compile as a clean PDF manuscript.
              </p>
            </div>

            <div className="pl-step">
              <div className="pl-step__num">02</div>
              <h3 className="pl-step__title">Submit & Timestamp</h3>
              <p className="pl-step__text">
                Upload version 1.0 to Hyperdata Lab. Your submission receives an automated cryptographic
                record and is queued for faculty assignment.
              </p>
            </div>

            <div className="pl-step">
              <div className="pl-step__num">03</div>
              <h3 className="pl-step__title">Review & Refine</h3>
              <p className="pl-step__text">
                Assigned lecturers review your work and provide specific, contextual recommendations.
                Upload updated versions directly addressing review notes.
              </p>
            </div>

            <div className="pl-step">
              <div className="pl-step__num">04</div>
              <h3 className="pl-step__title">Publish After Approval</h3>
              <p className="pl-step__text">
                Once reviewers recommend approval and administrators confirm standards, your preprint
                is marked as publication-ready for broader scholarly dissemination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Integrity */}
      <section id="integrity" className="pl-section pl-section--alt">
        <div className="pl-container">
          <div className="pl-integrity-card">
            <div className="pl-integrity-card__main">
              <span className="pl-eyebrow">Standards & Clarity</span>
              <h2 className="pl-section-title">Built on Academic Integrity</h2>
              <p className="pl-integrity-card__text">
                Hyperdata Lab Preprint clarifies the distinction between early research dissemination
                and formal peer-reviewed literature. We uphold rigorous ethical transparency:
              </p>

              <div className="pl-integrity-points">
                <div className="pl-integrity-point">
                  <strong>Preprint Status:</strong> A preprint is an author-owned, non-final scientific manuscript.
                  It allows rapid sharing and critique without claiming certified peer-reviewed journal status.
                </div>
                <div className="pl-integrity-point">
                  <strong>Transparent Review:</strong> Feedback is provided by verified lecturers and academic supervisors
                  to improve manuscript quality, ensuring clear accountability.
                </div>
                <div className="pl-integrity-point">
                  <strong>Editorial Gate:</strong> Lecturers provide reviews and recommendations, while administrators
                  hold final decision authority to publish approved manuscripts.
                </div>
              </div>
            </div>

            <div className="pl-integrity-card__side">
              <div className="pl-distinction-box">
                <div className="pl-distinction-header">Distinction at a Glance</div>
                <div className="pl-distinction-row">
                  <span className="pl-distinction-label">Author Ownership</span>
                  <span className="pl-distinction-val">100% Student/Author</span>
                </div>
                <div className="pl-distinction-row">
                  <span className="pl-distinction-label">Review Model</span>
                  <span className="pl-distinction-val">Faculty Guidance</span>
                </div>
                <div className="pl-distinction-row">
                  <span className="pl-distinction-label">Version Audit</span>
                  <span className="pl-distinction-val">Immutable Timestamps</span>
                </div>
                <div className="pl-distinction-row">
                  <span className="pl-distinction-label">Publish Gate</span>
                  <span className="pl-distinction-val">Admin Moderated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Value */}
      <section id="roles" className="pl-section">
        <div className="pl-container">
          <div className="pl-section-head">
            <span className="pl-eyebrow">Community</span>
            <h2 className="pl-section-title">Designed for every academic role</h2>
            <p className="pl-section-subtitle">
              Structured workspaces tailored specifically to each stage of the research lifecycle.
            </p>
          </div>

          <div className="pl-grid pl-grid--3">
            <div className="pl-card pl-card--role">
              <div className="pl-role-badge">For Students</div>
              <h3 className="pl-card__title">Launch Your Research</h3>
              <ul className="pl-role-list">
                <li>Submit manuscripts without complex journal overhead</li>
                <li>Track revisions across chronological versions</li>
                <li>Receive direct, constructive faculty feedback</li>
                <li>Build an academic portfolio before graduation</li>
              </ul>
            </div>

            <div className="pl-card pl-card--role">
              <div className="pl-role-badge">For Lecturers</div>
              <h3 className="pl-card__title">Mentor & Review</h3>
              <ul className="pl-role-list">
                <li>Access an organized review queue of student work</li>
                <li>Examine manuscripts with inline PDF preview</li>
                <li>Provide line-by-line feedback and revision notes</li>
                <li>Recommend revisions or approval with confidence</li>
              </ul>
            </div>

            <div className="pl-card pl-card--role">
              <div className="pl-role-badge">For Administrators</div>
              <h3 className="pl-card__title">Govern & Publish</h3>
              <ul className="pl-role-list">
                <li>Assign expert faculty reviewers to submissions</li>
                <li>Monitor institutional preprint activity and velocity</li>
                <li>Maintain rigorous quality and academic ethics</li>
                <li>Exercise final publishing gatekeeper authority</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="pl-section pl-section--alt">
        <div className="pl-container pl-container--narrow">
          <div className="pl-section-head">
            <span className="pl-eyebrow">Knowledge</span>
            <h2 className="pl-section-title">Frequently Asked Questions</h2>
            <p className="pl-section-subtitle">
              Common questions about preprints, the review process, and publication guidelines.
            </p>
          </div>

          <div className="pl-faq-list">
            <details className="pl-faq-item" open>
              <summary className="pl-faq-question">
                <span>What is a preprint and does it prevent formal journal publication?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                A preprint is a complete scientific manuscript shared before formal peer review. Most major
                academic publishers (including IEEE, Elsevier, Springer Nature, and ACM) explicitly allow authors
                to share preprints before submitting to their journals. A preprint establishes your priority
                without forfeiting your publication rights.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>Who can register and submit manuscripts to Hyperdata Lab Preprint?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                Hyperdata Lab Preprint is open to undergraduate and graduate students, academic researchers,
                and faculty. Registration is managed through our central Single Sign-On (SSO) service.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>Can I update my manuscript after uploading it?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                Yes. Research is iterative. When lecturers provide feedback or you improve your findings,
                you can submit a new version (e.g. v2.0). All previous versions remain preserved in your
                version history to maintain a transparent, honest academic record.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>How are preprints reviewed and approved?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                Submissions are assigned to qualified faculty lecturers who assess manuscript clarity,
                methodological soundness, and academic relevance. Reviewers can request revisions or recommend
                approval. Final publication authorization is granted by an administrator.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>Is there any cost to submit or read preprints?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                No. Hyperdata Lab Preprint is entirely free for students, researchers, and educators. Our goal
                is to foster open science and accelerate academic innovation.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="pl-section pl-cta-section">
        <div className="pl-container pl-container--narrow">
          <div className="pl-cta-box">
            <span className="pl-eyebrow pl-eyebrow--light">Get Started Today</span>
            <h2 className="pl-cta-title">Ready to begin your research journey?</h2>
            <p className="pl-cta-text">
              Create your student account in minutes via Single Sign-On, upload your first draft,
              and connect with academic reviewers.
            </p>
            <div className="pl-cta-actions">
              <Link href="/register" className="pl-btn pl-btn--primary pl-btn--lg">
                Create a student account
              </Link>
              <Link href="/api/auth/login" className="pl-btn pl-btn--secondary pl-btn--lg">
                Sign in
              </Link>
            </div>
            <p className="pl-cta-note">
              No subscription or publication fees • Transparent academic governance
            </p>
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
              <a href="#how-it-works" className="pl-link">How it works</a>
              <a href="#why-preprint" className="pl-link">Why preprint</a>
              <a href="#roles" className="pl-link">Academic roles</a>
            </div>
            <div className="pl-footer__col">
              <h4>Integrity</h4>
              <a href="#integrity" className="pl-link">Research standards</a>
              <a href="#faq" className="pl-link">FAQ</a>
              <Link href="/api/auth/login" className="pl-link">Faculty login</Link>
            </div>
            <div className="pl-footer__col">
              <h4>Access</h4>
              <Link href="/register" className="pl-link">Student sign up</Link>
              <Link href="/api/auth/login" className="pl-link">Single Sign-On</Link>
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
