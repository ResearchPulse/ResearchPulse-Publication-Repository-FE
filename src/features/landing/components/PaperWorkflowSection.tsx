export function PaperWorkflowSection() {
  const steps = [
    {
      step: '01',
      title: 'Draft & Cryptographic Timestamp',
      eyebrow: 'ESTABLISH PRIORITY',
      desc: 'Submit your preliminary manuscript in PDF format with title, abstract, and authors. The repository generates an immutable SHA-256 hash and timestamp, locking your scientific discovery date.',
      badge: 'Immediate Timestamp',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <circle cx="12" cy="14" r="3" />
          <polyline points="12 12 12 14 14 15" />
        </svg>
      ),
    },
    {
      step: '02',
      title: 'Faculty Mentorship & Review',
      eyebrow: 'ACADEMIC RIGOR',
      desc: 'Qualified university faculty and lecturers review your work. Mentors provide contextual notes, verify experimental rigor, and point out areas for improvement before broad dissemination.',
      badge: 'Human Oversight',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      step: '03',
      title: 'Iterative Version Management',
      eyebrow: 'CHRONOLOGICAL AUDIT',
      desc: 'Address lecturer comments and upload revised versions (v1.0 → v2.0). Every previous iteration is preserved in a public version tree to showcase honest scientific evolution.',
      badge: 'Audit Trail',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      ),
    },
    {
      step: '04',
      title: 'Repository Archiving & Journal Handoff',
      eyebrow: 'GLOBAL CITABILITY',
      desc: 'Following editorial moderation, your preprint is indexed with a persistent DOI citation, ready for academic defense, grants, or submission to indexed journals (IEEE, Springer, Elsevier).',
      badge: 'Permanent DOI',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
  ];

  return (
    <section className="paper-workflow-section paper-container" id="workflow">
      <div className="paper-section-heading paper-reveal">
        <div>
          <p className="paper-eyebrow">Clear, Traceable Progression</p>
          <h2>How Your Research Moves Through HyperData Lab</h2>
        </div>
        <p>
          A structured 4-stage pipeline that bridges student initiative with institutional review and open scientific dissemination.
        </p>
      </div>

      <div className="paper-workflow-grid">
        {steps.map((item, idx) => (
          <div className="paper-workflow-card paper-reveal" key={item.step}>
            <div className="paper-workflow-top">
              <div className="paper-workflow-step-num">{item.step}</div>
              <span className="paper-workflow-badge">{item.badge}</span>
            </div>

            <div className="paper-workflow-icon-wrap">
              {item.icon}
            </div>

            <span className="paper-workflow-eyebrow">{item.eyebrow}</span>
            <h3 className="paper-workflow-title">{item.title}</h3>
            <p className="paper-workflow-desc">{item.desc}</p>

            {idx < steps.length - 1 && (
              <div className="paper-workflow-connector" aria-hidden="true">
                <span>→</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
