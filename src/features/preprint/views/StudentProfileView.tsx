'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentDashboardLayout } from '../components';
import { usePreprintList } from '../hooks';

export function StudentProfileView() {
  const { items } = usePreprintList();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EDIT' | 'CREDENTIALS' | 'MANUSCRIPTS'>('OVERVIEW');
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: 'Nguyen Minh An',
    role: 'Undergraduate Researcher (B.S. Candidate)',
    studentId: '2026-HCMUT-0482',
    institution: 'VNU-HCM University of Technology (HCMUT)',
    department: 'Faculty of Computer Science & Engineering',
    major: 'Software & Data Engineering',
    email: 'an.nguyen@student.hcmut.edu.vn',
    secondaryEmail: 'an.nguyen.scholar@gmail.com',
    phone: '+84 912 345 678',
    location: 'Ho Chi Minh City, Vietnam',
    orcid: '0009-0004-7821-9920',
    bio: 'Undergraduate researcher focusing on statistical data literacy, reproducible computational notebooks, and cryptographic preprint provenance in student-led scientific publishing.',
    interests: ['Data Literacy', 'Open Science', 'ANOVA Statistics', 'Reproducible Notebooks', 'Cryptographic Preprints', 'Peer Review Integrity'],
    advisor: 'Dr. Linh Tran (Advisory Board Chair)',
    lab: 'Hyperdata Analytics & Open Science Lab (HARL)',
    googleScholar: 'https://scholar.google.com/citations?user=minhan2026',
    github: 'https://github.com/minhan-research',
  });

  const [formData, setFormData] = useState({ ...profileData });

  const handleCopyProfileLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData({ ...formData });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    setActiveTab('OVERVIEW');
  };

  return (
    <StudentDashboardLayout
      title="Scholar Profile"
      revisionCount={items.filter((i) => i.status === 'NEEDS_REVISION').length}
      totalCount={items.length}
    >
      {/* 1. Scholar Profile Hero Header Card */}
      <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        {/* Cover Banner with Academic Theme */}
        <div
          style={{
            height: '140px',
            background: 'linear-gradient(135deg, #0071bc 0%, #004d80 50%, #002b4d 100%)',
            position: 'relative',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
              opacity: 0.8,
            }}
          />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="dashboard-table__cite-btn"
              onClick={handleCopyProfileLink}
              style={{ background: 'rgba(255, 255, 255, 0.95)', borderColor: '#ffffff', color: '#0071bc', fontWeight: 600 }}
            >
              {copiedLink ? 'Link Copied!' : 'Copy Profile Link'}
            </button>
            <button
              type="button"
              className="dashboard-table__cite-btn"
              onClick={() => alert('Exporting Academic Dossier PDF for Nguyen Minh An (ID: STU-2026-HCMUT)...')}
              style={{ background: 'rgba(255, 255, 255, 0.95)', borderColor: '#ffffff', color: '#0f172a' }}
            >
              Export Dossier (PDF)
            </button>
          </div>
        </div>

        {/* Profile Avatar & Info Row */}
        <div style={{ padding: '0 28px 24px', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '-50px',
              marginBottom: '16px',
            }}
          >
            {/* Avatar Lockup */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: '#0071bc',
                  border: '4px solid #ffffff',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 800,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <span>NA</span>
                <span
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '3px solid #ffffff',
                  }}
                  title="Active Author Status"
                />
              </div>

              <div style={{ paddingBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                    {profileData.name}
                  </h1>
                  <span
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    Verified Student Author
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                  {profileData.role} &bull; {profileData.institution}
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              className="dashboard-filter-btn"
              onClick={() => setActiveTab(activeTab === 'EDIT' ? 'OVERVIEW' : 'EDIT')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                color: '#0f172a',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>{activeTab === 'EDIT' ? 'View Overview' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Key Identifiers Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '6px' }}>
            <span className="dashboard-badge-tag" style={{ background: '#f8fafc', borderColor: '#cbd5e1', color: '#334155' }}>
              Student ID: <strong>{profileData.studentId}</strong>
            </span>
            <a
              href={`https://orcid.org/${profileData.orcid}`}
              target="_blank"
              rel="noreferrer"
              className="dashboard-badge-tag"
              style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <span>ORCID:</span>
              <strong>{profileData.orcid}</strong>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <span className="dashboard-badge-tag" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>
              Dept: <strong>{profileData.department}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert if saved */}
      {saveSuccess && (
        <div className="dashboard-alert-banner" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', marginBottom: '20px' }}>
          <div className="dashboard-alert-banner__icon" style={{ color: '#059669' }}>✓</div>
          <div className="dashboard-alert-banner__content">
            <strong className="dashboard-alert-banner__title" style={{ color: '#065f46' }}>Profile Updated</strong>
            <p className="dashboard-alert-banner__desc" style={{ color: '#047857' }}>
              Your academic profile changes have been successfully saved and synced across the repository.
            </p>
          </div>
        </div>
      )}

      {/* 2. Key Academic Stats Counters */}
      <div className="dashboard-metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Manuscripts Authored</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{items.length}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--neutral">
            <span>Registered in Hyperdata Lab</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Archived Versions</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--sky">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">5</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--sky">
            <span>Cryptographic SHA-256 releases</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Verified DOIs</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">2</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--green">
            <span>Zenodo / Crossref indexed</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Total Citations</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">18</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--amber">
            <span>Academic citation references</span>
          </div>
        </div>
      </div>

      {/* 3. Main Profile Navigation Tabs & Content */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        {/* Navigation Tabs Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
            overflowX: 'auto',
            gap: '8px',
          }}
        >
          <button
            type="button"
            className={`dashboard-filter-btn ${activeTab === 'OVERVIEW' ? 'dashboard-filter-btn--active' : ''}`}
            onClick={() => setActiveTab('OVERVIEW')}
            style={{ borderRadius: '0', border: 'none', borderBottom: activeTab === 'OVERVIEW' ? '3px solid #0071bc' : '3px solid transparent', padding: '16px 12px', fontWeight: 700 }}
          >
            Overview &amp; Bio
          </button>
          <button
            type="button"
            className={`dashboard-filter-btn ${activeTab === 'EDIT' ? 'dashboard-filter-btn--active' : ''}`}
            onClick={() => setActiveTab('EDIT')}
            style={{ borderRadius: '0', border: 'none', borderBottom: activeTab === 'EDIT' ? '3px solid #0071bc' : '3px solid transparent', padding: '16px 12px', fontWeight: 700 }}
          >
            Edit Profile
          </button>
          <button
            type="button"
            className={`dashboard-filter-btn ${activeTab === 'CREDENTIALS' ? 'dashboard-filter-btn--active' : ''}`}
            onClick={() => setActiveTab('CREDENTIALS')}
            style={{ borderRadius: '0', border: 'none', borderBottom: activeTab === 'CREDENTIALS' ? '3px solid #0071bc' : '3px solid transparent', padding: '16px 12px', fontWeight: 700 }}
          >
            Academic Credentials &amp; Security
          </button>
          <button
            type="button"
            className={`dashboard-filter-btn ${activeTab === 'MANUSCRIPTS' ? 'dashboard-filter-btn--active' : ''}`}
            onClick={() => setActiveTab('MANUSCRIPTS')}
            style={{ borderRadius: '0', border: 'none', borderBottom: activeTab === 'MANUSCRIPTS' ? '3px solid #0071bc' : '3px solid transparent', padding: '16px 12px', fontWeight: 700 }}
          >
            Authored Manuscripts ({items.length})
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '24px' }}>
          {/* TAB 1: OVERVIEW & BIO */}
          {activeTab === 'OVERVIEW' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Left: Bio & Research Statement */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                  Research Statement &amp; Bio
                </h3>
                <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', lineHeight: 1.6, color: '#334155', fontSize: '14px', marginBottom: '20px' }}>
                  {profileData.bio}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                  Research Domains &amp; Keywords
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {profileData.interests.map((interest) => (
                    <span
                      key={interest}
                      style={{
                        background: '#eff6ff',
                        color: '#0071bc',
                        border: '1px solid #b8dcef',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                      }}
                    >
                      #{interest}
                    </span>
                  ))}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                  Faculty Mentorship &amp; Advisory
                </h3>
                <div style={{ padding: '16px 20px', background: '#f8fbfe', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0071bc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      LT
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>Dr. Linh Tran</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Primary Faculty Advisor • Advisory Board Chair</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      NT
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>Assoc. Prof. Nguyen Van Thuan</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Scope Reviewer &bull; Department of Computing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Academic & Institutional Information Table */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                  Institutional Affiliation &amp; Contacts
                </h3>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Institution</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{profileData.institution}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Faculty</span>
                    <span style={{ fontSize: '13px', color: '#0f172a' }}>{profileData.department}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Major / Degree</span>
                    <span style={{ fontSize: '13px', color: '#0f172a' }}>{profileData.major}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Student Email</span>
                    <a href={`mailto:${profileData.email}`} style={{ fontSize: '13px', color: '#0071bc', textDecoration: 'none', fontWeight: 600 }}>
                      {profileData.email}
                    </a>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Secondary Email</span>
                    <span style={{ fontSize: '13px', color: '#0f172a' }}>{profileData.secondaryEmail}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Research Lab</span>
                    <span style={{ fontSize: '13px', color: '#0f172a' }}>{profileData.lab}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', background: '#f8fafc' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Location</span>
                    <span style={{ fontSize: '13px', color: '#0f172a' }}>{profileData.location}</span>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <a
                    href={profileData.github}
                    target="_blank"
                    rel="noreferrer"
                    className="dashboard-table__cite-btn"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                  >
                    GitHub Profile ↗
                  </a>
                  <a
                    href={profileData.googleScholar}
                    target="_blank"
                    rel="noreferrer"
                    className="dashboard-table__cite-btn"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                  >
                    Google Scholar ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT PROFILE FORM */}
          {activeTab === 'EDIT' && (
            <form onSubmit={handleSaveProfile} style={{ maxWidth: '720px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                Edit Scholar Profile Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Full Display Name
                  </label>
                  <input
                    type="text"
                    className="student-topbar__search-input"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Academic Role / Candidate Title
                  </label>
                  <input
                    type="text"
                    className="student-topbar__search-input"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Research Statement &amp; Academic Bio
                </label>
                <textarea
                  rows={4}
                  className="student-topbar__search-input"
                  style={{ width: '100%', height: 'auto', padding: '12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'inherit', fontSize: '13.5px', lineHeight: 1.5 }}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    University / Institution
                  </label>
                  <input
                    type="text"
                    className="student-topbar__search-input"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Faculty &amp; Department
                  </label>
                  <input
                    type="text"
                    className="student-topbar__search-input"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Secondary / Contact Email
                  </label>
                  <input
                    type="email"
                    className="student-topbar__search-input"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    value={formData.secondaryEmail}
                    onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="student-topbar__search-input"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Research Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  className="student-topbar__search-input"
                  style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  value={formData.interests.join(', ')}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="submit"
                  className="dashboard-filter-btn dashboard-filter-btn--active"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Save Profile Changes
                </button>
                <button
                  type="button"
                  className="dashboard-filter-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setFormData({ ...profileData });
                    setActiveTab('OVERVIEW');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ACADEMIC CREDENTIALS & SECURITY */}
          {activeTab === 'CREDENTIALS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '840px' }}>
              {/* ORCID iD Card */}
              <div style={{ border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '15px', color: '#166534' }}>ORCID Academic Registry</strong>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                      CONNECTED
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#15803d' }}>
                    Authenticated author record synced with Crossref and preprint citation indexers.
                  </p>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', color: '#166534' }}>
                    https://orcid.org/{profileData.orcid}
                  </span>
                </div>
                <a
                  href={`https://orcid.org/${profileData.orcid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="dashboard-filter-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    fontSize: '12.5px',
                    color: '#15803d',
                    background: '#ffffff',
                    borderColor: '#86efac',
                    textDecoration: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                  }}
                >
                  Verify on ORCID ↗
                </a>
              </div>

              {/* Institutional SSO Card */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>University Single Sign-On (SSO)</strong>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                      ACTIVE
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Identity validated via VNU-HCM Central Identity Provider (CAS/OAuth2).
                  </p>
                  <span style={{ fontSize: '12px', color: '#475569' }}>
                    Primary User: <strong>{profileData.email}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  className="dashboard-filter-btn"
                  onClick={() => alert('SSO Session is active and bound to STU-2026-HCMUT.')}
                >
                  Check SSO Status
                </button>
              </div>

              {/* Cryptographic Signing Key for Preprints */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>Preprint Cryptographic Signing Key</strong>
                  <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                    VALIDATED
                  </span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b' }}>
                  Used to generate immutable SHA-256 cryptographic provenance timestamps when releasing new versions.
                </p>
                <div style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12.5px', color: '#0f172a', wordBreak: 'break-all' }}>
                  4A9F 82BC 3D10 E77F 921A C67B 5E88 4898 DA28 0471 (Ed25519-Preprint-Signature)
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUTHORED MANUSCRIPTS */}
          {activeTab === 'MANUSCRIPTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Authored Manuscripts in Hyperdata Lab Repository
                </h3>
                <Link href="/student/my-preprints/new" className="dashboard-table__cite-btn" style={{ color: '#0071bc', borderColor: '#b8dcef' }}>
                  + New Preprint Submission
                </Link>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="dashboard-badge-tag">{item.discipline}</span>
                      <span className="dashboard-version-pill">v{item.current_version}</span>
                      <span
                        className={`user-badge ${
                          item.status === 'NEEDS_REVISION'
                            ? 'user-badge--revision'
                            : item.status === 'UNDER_REVIEW'
                            ? 'user-badge--review'
                            : 'user-badge--approved'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                      {item.title}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      DOI: {item.doi || '10.5281/zenodo.hdl-preview'} &bull; Updated: {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link href={`/student/my-preprints/${item.id}`} className="dashboard-table__action-btn">
                      View Details →
                    </Link>
                    <Link href="/student/versions" className="dashboard-table__cite-btn">
                      Versions
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export default StudentProfileView;
