'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { StudentShell } from '../components';
import { LecturerShell } from '@/features/lecturer/components';
import { studentPreprintApi } from '../api';
import type { StudentPreprint, PreprintAnalysis } from '../types';
import { FormSkeleton } from '@/components/skeleton';

const DISCIPLINES = [
  'Computer Science & Artificial Intelligence',
  'Information Technology & Software Engineering',
  'Data Science & Machine Learning',
  'Electrical & Electronics Engineering',
  'Mathematics & Applied Statistics',
  'Physics & Materials Science',
  'Biological & Medical Sciences',
  'Environmental & Earth Sciences',
  'Social Sciences & Economics',
  'Interdisciplinary Scientific Research',
];

interface SearchableDisciplineSelectProps {
  value: string;
  onChange: (val: string) => void;
}

function SearchableDisciplineSelect({ value, onChange }: SearchableDisciplineSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filtered = DISCIPLINES.filter((d) =>
    d.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setSearchQuery('');
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  };

  const handleSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
  };

  return (
    <div className="student-searchable-select" ref={containerRef}>
      <button
        type="button"
        id="field-discipline"
        className={`student-searchable-select__trigger ${isOpen ? 'student-searchable-select__trigger--open' : ''}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? 'student-searchable-select__value' : 'student-searchable-select__placeholder'}>
          {value || 'Select a research discipline'}
        </span>
        <svg
          className={`student-searchable-select__arrow ${isOpen ? 'student-searchable-select__arrow--open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="student-searchable-select__dropdown" role="listbox">
          <div className="student-searchable-select__search-wrapper">
            <svg
              className="student-searchable-select__search-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="student-searchable-select__search-input"
              placeholder="Search discipline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <ul className="student-searchable-select__options">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const isSelected = item === value;
                return (
                  <li
                    key={item}
                    role="option"
                    aria-selected={isSelected}
                    className={`student-searchable-select__option ${
                      isSelected ? 'student-searchable-select__option--selected' : ''
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    <span>{item}</span>
                    {isSelected && (
                      <svg
                        className="student-searchable-select__check"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="student-searchable-select__option--empty">
                No research disciplines found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

interface PreprintEditorViewProps {
  id?: string;
}

function PreprintWorkspaceShell({
  isLecturer,
  title,
  kicker,
  children,
}: {
  isLecturer: boolean;
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return isLecturer
    ? <LecturerShell active="submissions" title={title}>{children}</LecturerShell>
    : <StudentShell title={title} kicker={kicker}>{children}</StudentShell>;
}

export function PreprintEditorView({ id }: PreprintEditorViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const isEditing = Boolean(id);
  const isLecturer = user?.role === 'LECTURER';
  const isLecturerRoute = pathname?.startsWith('/lecturer/') ?? false;
  const workspacePath = isLecturer ? '/lecturer/submissions' : '/student/my-preprints';
  const devMockSubmitEnabled = process.env.NEXT_PUBLIC_DEV_MOCK_SUBMIT === 'true';

  // Form states
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');

  // Authors are extracted from the uploaded PDF. New contributors can be added
  // before submission and are sent through the metadata update endpoint.
  const [authors, setAuthors] = useState<StudentPreprint['authors']>([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');
  const [newAuthorStudentId, setNewAuthorStudentId] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState<'STUDENT' | 'LECTURER' | 'ADMIN'>('STUDENT');
  const [newAuthorInst, setNewAuthorInst] = useState('');
  const [showAddAuthor, setShowAddAuthor] = useState(false);

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // UI status
  const [loadingInitial, setLoadingInitial] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [originalItem, setOriginalItem] = useState<StudentPreprint | null>(null);
  const [analysis, setAnalysis] = useState<PreprintAnalysis | null>(null);

  // Load existing data if editing
  useEffect(() => {
    if (!id) return;
    let active = true;
    studentPreprintApi.get(id)
      .then((item) => {
        if (!active) return;
        setOriginalItem(item);
        setTitle(item.titleNeedsInput ? '' : item.title || '');
        if (item.discipline) setDiscipline(item.discipline);
        setAbstractText(item.abstract || '');
        if (item.keywords?.length) setKeywordsInput(item.keywords.join(', '));
        setIsPrivate(Boolean((item as StudentPreprint & { is_private?: boolean }).is_private));
        if (item.file_name) {
          setFileName(item.file_name);
          setFileSize(item.file_size || null);
          setFileHash(item.sha256 || null);
        }
        setAuthors(item.authors || []);
      })
      .catch((err) => {
        if (active) setFormError(err instanceof Error ? err.message : 'Failed to load preprint draft.');
      })
      .finally(() => {
        if (active) setLoadingInitial(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleFile = async (selectedFile: File) => {
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setFormError('Only PDF files are accepted.');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setFormError('PDF file size cannot exceed 50MB.');
      return;
    }

    setFormError(null);
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(`${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`);
    setAnalysis(null);
    setIsAnalyzing(true);

    try {
      const digest = await globalThis.crypto.subtle.digest('SHA-256', await selectedFile.arrayBuffer());
      setFileHash(Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join(''));
    } catch {
      setFileHash(null);
    }

    try {
      const result = await studentPreprintApi.analyze(selectedFile);
      setAnalysis(result);
      setTitle(result.title || '');
      setAbstractText(result.abstract || '');
      setKeywordsInput('');
      setDiscipline(isEditing ? discipline : '');
      setAuthors(result.authors);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to analyze the selected PDF.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.[0]) void handleFile(event.dataTransfer.files[0]);
  };

  const addCoAuthor = () => {
    if (!newAuthorName.trim()) return;
    if (newAuthorRole === 'STUDENT' && !newAuthorStudentId.trim()) return;
    if (newAuthorRole !== 'STUDENT' && !newAuthorEmail.trim()) return;
    setAuthors([
      ...authors,
      {
        name: newAuthorName.trim(),
        email: newAuthorEmail.trim(),
        studentId: newAuthorStudentId.trim() || undefined,
        role: newAuthorRole,
        institution: newAuthorInst.trim() || 'Institution unavailable',
        isPrimary: false,
      },
    ]);
    setNewAuthorName('');
    setNewAuthorEmail('');
    setNewAuthorStudentId('');
    setNewAuthorRole('STUDENT');
    setNewAuthorInst('');
    setShowAddAuthor(false);
  };

  const removeCoAuthor = (index: number) => {
    setAuthors(authors.filter((_, authorIndex) => authorIndex !== index + 1));
  };

  const isRevisionMode = originalItem?.status === 'NEEDS_REVISION' || originalItem?.revision_required === true;
  const isReadOnly = Boolean(originalItem && originalItem.status !== 'DRAFT' && !isRevisionMode);
  const latestReview = originalItem?.reviews?.[0];

  const showError = (msg: string) => {
    setFormError(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (submitNow: boolean, useMockSubmit = false) => {
    if (isReadOnly) {
      setFormError('Bản thảo đã nộp và đang trong quá trình xét duyệt, không thể chỉnh sửa.');
      return;
    }

    if (isAnalyzing) {
      showError('Please wait for GROBID extraction to finish before saving or submitting.');
      return;
    }

    setFormError(null);

    if (submitNow && !useMockSubmit) {
      if (!isEditing && !file) {
        showError('A PDF manuscript file is required before submitting for faculty review.');
        return;
      }
      if ((originalItem?.status === 'NEEDS_REVISION' || originalItem?.revision_required) && !changeSummary.trim()) {
        showError('Please provide a Summary of Changes addressing the reviewer comments.');
        return;
      }
    }

    if (!isEditing && !file) {
      showError('Attach a PDF manuscript before saving this draft.');
      return;
    }

    const basePrimaryAuthor = {
      name: primaryAuthorName,
      email: primaryAuthorEmail,
      studentId: isLecturer ? undefined : (user?.studentId || ''),
      role: isLecturer ? ('LECTURER' as const) : ('STUDENT' as const),
      institution: primaryAuthorInst,
      isPrimary: true,
      isCorresponding: true,
    };
    const sourceAuthors = authors.length > 0 ? authors : [basePrimaryAuthor];
    const uniqueAuthors = sourceAuthors.filter((author, index, list) => (
      list.findIndex((candidate) => (
        (candidate.email && author.email && candidate.email.toLowerCase() === author.email.toLowerCase())
          || candidate.name.trim().toLowerCase() === author.name.trim().toLowerCase()
      )) === index
    ));

    if (submitNow) {
      if (!useMockSubmit) {
        const incompleteAuthors = uniqueAuthors.filter((author) => {
          const role = author.role || (author.studentId ? 'STUDENT' : (isLecturer ? 'LECTURER' : 'STUDENT'));
          return role === 'STUDENT' ? !author.studentId?.trim() : !author.email?.trim();
        });
        if (incompleteAuthors.length > 0) {
          showError('Cần đăng ký thành viên (Các tác giả phải có MSSV hoặc Email).');
          return;
        }
      }
      if (!discipline.trim()) {
        showError('Research Discipline / Field is required before submitting.');
        return;
      }
      if (!title.trim()) {
        showError('Manuscript title is required before submitting.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const keywords = keywordsInput.split(',').map((keyword) => keyword.trim()).filter(Boolean);
      const metadata = {
        title: title.trim() || undefined,
        abstract: abstractText.trim() || undefined,
        discipline: discipline.trim() || undefined,
        keywords,
        isPrivate: isLecturer ? isPrivate : undefined,
        authors: uniqueAuthors.map((author, index) => ({
          name: author.name.trim(),
          email: author.email?.trim() || undefined,
          studentId: author.studentId?.trim() || undefined,
          role: author.role || (author.studentId ? 'STUDENT' as const : 'LECTURER' as const),
          affiliation: author.institution?.trim() || undefined,
          orderIndex: index,
        })),
      };

      if (!isEditing) {
        const uploadedPublication = await studentPreprintApi.upload(file!, submitNow && !useMockSubmit ? 'SUBMIT' : 'DRAFT', metadata);
        if (useMockSubmit) await studentPreprintApi.mockSubmit(uploadedPublication.id);
        router.push(`${workspacePath}/${uploadedPublication.id}`);
        router.refresh();
        return;
      }

      const publicationId = id!;
      if (file) {
        const uploadedPublication = await studentPreprintApi.uploadRevision(publicationId, file, changeSummary.trim() || undefined);
        setFileName(uploadedPublication.file_name || fileName);
        setFileSize(uploadedPublication.file_size || fileSize);
        setFileHash(uploadedPublication.sha256 || fileHash);
      }

      await studentPreprintApi.update(publicationId, metadata);
      if (isLecturer) {
        await studentPreprintApi.setPrivate(publicationId, isPrivate);
      }
      if (submitNow) {
        if (useMockSubmit) await studentPreprintApi.mockSubmit(publicationId);
        else await studentPreprintApi.submit(publicationId);
      }

      router.push(`${workspacePath}/${publicationId}`);
      router.refresh();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'An error occurred while saving the preprint.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const primaryAuthor = authors[0] || originalItem?.authors?.[0];
  const primaryAuthorName = primaryAuthor?.name || user?.name || user?.email?.split('@')[0] || (isLecturer ? 'Logged-in Lecturer' : 'Logged-in Student');
  const primaryAuthorEmail = primaryAuthor?.email || user?.email || (isLecturer ? 'lecturer@university.edu.vn' : 'student@university.edu.vn');
  const primaryAuthorStudentId = primaryAuthor?.studentId || user?.studentId || '';
  const primaryAuthorInst = primaryAuthor?.institution || 'University Research Faculty';
  const primaryInitials = primaryAuthorName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || (isLecturer ? 'GV' : 'ST');

  if (authLoading) {
    return (
      <main
        role="status"
        aria-live="polite"
        style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '32px', color: '#64748b' }}
      >
        Loading workspace…
      </main>
    );
  }

  if (isLecturerRoute && user?.role !== 'LECTURER') {
    return (
      <main
        role="alert"
        style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '32px', color: '#b91c1c' }}
      >
        This workspace requires an active Lecturer account.
      </main>
    );
  }

  return (
    <PreprintWorkspaceShell
      isLecturer={isLecturer}
      title={
        isReadOnly
          ? `Bản thảo: ${originalItem?.status === 'UNDER_REVIEW' ? 'Đang xét duyệt' : originalItem?.status}`
          : isRevisionMode
            ? `Revise Manuscript: v${Number((originalItem?.current_version || 1) + 0.1).toFixed(1)}`
            : isEditing
              ? 'Edit Manuscript Draft'
              : 'Start a New Preprint'
      }
      kicker={isReadOnly ? 'Submitted Manuscript' : isRevisionMode ? 'Revision Submission' : 'Manuscript Registration'}
    >
      {loadingInitial ? (
        <FormSkeleton />
      ) : (
        <div className="student-editor-container">
          {/* Read-only Alert Banner */}
          {isReadOnly && (
            <div
              className="student-editor-status-banner"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '16px 20px',
                marginBottom: '20px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                color: '#1e40af',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', color: '#1e3a8a' }}>
                    Bản thảo đang trong trạng thái {originalItem?.status === 'UNDER_REVIEW' ? 'Đang xét duyệt (Under Review)' : originalItem?.status}
                  </strong>
                  <span style={{ fontSize: '13.5px', color: '#3b82f6' }}>
                    Bản thảo đã nộp không thể chỉnh sửa trực tiếp. Dữ liệu bản thảo được khóa trong quá trình thẩm định.
                  </span>
                </div>
              </div>
              <Link
                href={`${workspacePath}/${originalItem?.id || id}`}
                className="student-btn student-btn--primary"
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Xem chi tiết bản thảo →
              </Link>
            </div>
          )}

          {/* Reviewer Feedback Callout for Revisions */}
          {isRevisionMode && latestReview && (
            <div className="student-editor-revision-alert">
              <div className="student-editor-revision-alert__header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <h4>Feedback to Address from {latestReview.reviewer_name}</h4>
                  <p className="student-subtext">{latestReview.reviewer_title}</p>
                </div>
              </div>
              <blockquote className="student-editor-revision-alert__quote">
                &ldquo;{latestReview.comments}&rdquo;
              </blockquote>
              {latestReview.recommendations && latestReview.recommendations.length > 0 && (
                <div className="student-editor-revision-alert__recs">
                  <strong>Action Items:</strong>
                  <ul>
                    {latestReview.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div className="student-error-banner" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          <form
            className="student-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isReadOnly) handleSubmit(false);
            }}
          >
            {/* Step 01: Upload Manuscript PDF (trên cùng) */}
            <div className="student-form-section">
              <div className="student-form-section__header">
                <span className="student-step-number">01</span>
                <div>
                  <h3 className="student-form-section__title">Upload Manuscript PDF</h3>
                  <p className="student-form-section__desc">
                    Attach your camera-ready PDF document (up to 50MB). Once uploaded, GROBID automated extraction will parse the manuscript's metadata, title, and citations.
                  </p>
                </div>
              </div>

              {!fileName ? (
                <div
                  className={`student-dropzone ${isDragging ? 'student-dropzone--active' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    id="file-upload"
                    className="student-dropzone__input"
                    onChange={(e) => {
                      if (e.target.files?.[0]) void handleFile(e.target.files[0]);
                    }}
                  />
                  <label htmlFor="file-upload" className="student-dropzone__content">
                    <div className="student-dropzone__icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <strong className="student-dropzone__cta">Choose a PDF file or drag and drop here</strong>
                    <span className="student-dropzone__specs">PDF up to 50MB. Includes figures, tables, and citations.</span>
                  </label>
                </div>
              ) : (
                <div className="student-file-selected-card">
                  <div className="student-file-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="student-file-details">
                    <strong className="student-file-title">{fileName}</strong>
                    <div className="student-file-meta">
                      <span>{fileSize}</span>
                      <span className="student-separator">•</span>
                      <span className="student-file-hash-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {fileHash ? `SHA-256: ${fileHash.substring(0, 14)}…` : 'Checksum verified'}
                      </span>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setFileName(null);
                        setFileSize(null);
                        setFileHash(null);
                      }}
                      className="student-file-remove-btn"
                    >
                      Replace
                    </button>
                  )}
                </div>
              )}

              <div className="student-upload-specs-strip">
                <span className="student-spec-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  PDF max 50MB (Camera-Ready)
                </span>
                <span className="student-spec-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Automated GROBID Parser
                </span>
                <span className="student-spec-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  CC BY 4.0 Open Access
                </span>
                <span className="student-spec-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  48–72h Faculty Review SLA
                </span>
              </div>
            </div>

            {/* If Revision: Summary of Revisions (Author Response) */}
            {isRevisionMode && (
              <div className="student-form-section student-form-section--highlight">
                <div className="student-form-section__header">
                  <span className="student-step-number student-step-number--amber">★</span>
                  <div>
                    <h3 className="student-form-section__title">Summary of Revisions (Author Response)</h3>
                    <p className="student-form-section__desc">
                      Explain explicitly how this version addresses the reviewer comments above.
                    </p>
                  </div>
                </div>

                <div className="student-field">
                  <label htmlFor="field-changes" className="student-field__label">
                    Response to Reviewers &amp; Change Notes <span className="student-required">*</span>
                  </label>
                  <textarea
                    id="field-changes"
                    className="student-textarea"
                    rows={4}
                    placeholder="e.g., Added ANOVA verification table in Section 3.2, clarified OS benchmarking in Appendix A, and re-computed confidence intervals."
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 02: Authorship & Attribution */}
            <div className="student-form-section">
              <div className="student-form-section__header">
                <span className="student-step-number">02</span>
                <div>
                  <h3 className="student-form-section__title">Authorship & Attribution</h3>
                  <p className="student-form-section__desc">Primary submitter attribution is pre-filled from your profile. Add contributing co-authors if applicable.</p>
                </div>
              </div>

              {/* Primary Author */}
              <div className="student-author-card student-author-card--primary">
                <div className="student-author-avatar">{primaryInitials}</div>
                <div className="student-author-info">
                  <div className="student-author-name-row">
                    <strong>{primaryAuthorName}</strong>
                    <span className="student-author-pill">Primary Author</span>
                    <span className="student-author-pill">Corresponding</span>
                  </div>
                  <span className="student-author-meta">
                    {primaryAuthorEmail} • {isLecturer ? 'Giảng viên' : (primaryAuthorStudentId || 'MSSV chưa nhập')} • {primaryAuthorInst}
                  </span>
                  <span className={`student-author-verification student-author-verification--${authors[0]?.verificationStatus || 'MISSING_IDENTIFIER'}`}>
                    {authors[0]?.verificationStatus === 'VERIFIED' ? 'Active User verified' : 'Needs User verification before Submit'}
                  </span>
                </div>
              </div>

              {/* Co-authors list */}
              {authors.slice(1).map((ca, idx) => (
                <div key={idx} className="student-author-card">
                  <div className="student-author-avatar student-author-avatar--co">CA</div>
                  <div className="student-author-info">
                    <div className="student-author-name-row">
                      <strong>{ca.name}</strong>
                      <span className="student-author-pill student-author-pill--co">Co-Author</span>
                    </div>
                    <span className="student-author-meta">
                      {ca.email || 'Email chưa nhập'} • {ca.studentId || 'MSSV chưa nhập'} • {ca.institution}
                    </span>
                    <span className={`student-author-verification student-author-verification--${ca.verificationStatus || 'MISSING_IDENTIFIER'}`}>
                      {ca.verificationStatus === 'VERIFIED' ? 'Active User verified' : 'Needs User verification before Submit'}
                    </span>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeCoAuthor(idx)}
                      className="student-author-remove"
                      title="Remove author"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {/* Add Co-author Box */}
              {!isReadOnly && (showAddAuthor ? (
                <div className="student-add-author-box">
                  <h4>Add Co-Author</h4>
                  <div className="student-form-row">
                    <input
                      type="text"
                      className="student-input"
                      placeholder="Full Name"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                    />
                    <input
                      type="email"
                      className="student-input"
                      placeholder="University Email (lecturer/admin)"
                      value={newAuthorEmail}
                      onChange={(e) => setNewAuthorEmail(e.target.value)}
                    />
                    <input
                      type="text"
                      className="student-input"
                      placeholder="MSSV (student)"
                      value={newAuthorStudentId}
                      onChange={(e) => setNewAuthorStudentId(e.target.value)}
                    />
                    <select
                      className="student-select"
                      value={newAuthorRole}
                      onChange={(e) => setNewAuthorRole(e.target.value as 'STUDENT' | 'LECTURER' | 'ADMIN')}
                    >
                      <option value="STUDENT">Student author</option>
                      <option value="LECTURER">Lecturer author</option>
                      <option value="ADMIN">Admin author</option>
                    </select>
                    <input
                      type="text"
                      className="student-input"
                      placeholder="Institution (e.g. HCMUT, HUST)"
                      value={newAuthorInst}
                      onChange={(e) => setNewAuthorInst(e.target.value)}
                    />
                  </div>
                  <div className="student-add-author-actions">
                    <button type="button" onClick={addCoAuthor} className="student-btn student-btn--sm student-btn--primary">
                      Add Co-Author
                    </button>
                    <button type="button" onClick={() => setShowAddAuthor(false)} className="student-btn student-btn--sm student-btn--secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddAuthor(true)}
                  className="student-add-author-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Contributing Co-Author</span>
                </button>
              ))}
            </div>

            {/* Step 03: Manuscript Metadata & Discipline (chờ GROBID extract ra) */}
            <div className="student-form-section">
              <div className="student-form-section__header">
                <span className="student-step-number">03</span>
                <div>
                  <h3 className="student-form-section__title">Manuscript Metadata & Discipline</h3>
                  <p className="student-form-section__desc">
                    Metadata will be automatically extracted from your PDF via GROBID. You can review, refine, or fill in any missing details before submission.
                  </p>
                </div>
              </div>

              {/* Extraction notice */}
              {isAnalyzing ? (
                <div className="student-extraction-notice student-extraction-notice--waiting">
                  <span className="student-spinner" aria-hidden="true" />
                  <span><strong>Analyzing PDF with GROBID…</strong> No file is stored yet. Save and submit will be available after the analysis finishes.</span>
                </div>
              ) : analysis ? (
                <div className="student-extraction-notice student-extraction-notice--success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>
                    <strong>GROBID extraction ready:</strong> PDF <em>{fileName}</em> is held in this browser only. Review and edit the extracted metadata below before saving or submitting.
                  </span>
                </div>
              ) : (
                <div className="student-extraction-notice student-extraction-notice--waiting">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    <strong>Waiting for PDF analysis:</strong> Select a manuscript to extract title, abstract, date, and author candidates. Discipline and keywords are entered by you.
                  </span>
                </div>
              )}

              <div className="student-field">
                <label htmlFor="field-title" className="student-field__label">
                  Manuscript Title <span className="student-required">*</span>
                </label>
                <input
                  id="field-title"
                  type="text"
                  className="student-input"
                  placeholder="e.g., Mapping data literacy in undergraduate STEM research"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="student-field">
                <label htmlFor="field-discipline" className="student-field__label">
                  Research Discipline / Field <span className="student-required">*</span>
                </label>

                <input
                  id="field-discipline"
                  type="text"
                  className="student-input"
                  placeholder="e.g. Computer Science, Biomedical Engineering"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="student-field">
                <label htmlFor="field-keywords" className="student-field__label">
                  Keywords (comma separated)
                </label>
                <input
                  id="field-keywords"
                  type="text"
                  className="student-input"
                  placeholder="e.g. Data Literacy, STEM Education, Statistical Integrity"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="student-field">
                <div className="student-field__label-row">
                  <label htmlFor="field-abstract" className="student-field__label">
                    Abstract
                  </label>
                  <span className="student-char-count">{abstractText.length} characters</span>
                </div>
                <textarea
                  id="field-abstract"
                  className="student-textarea"
                  rows={6}
                  placeholder="Summarize the core research question, empirical methodology, primary findings, and scientific significance..."
                  value={abstractText}
                  onChange={(e) => setAbstractText(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              {isLecturer && (
                <div
                  className={`lecturer-privacy-card ${isPrivate ? 'lecturer-privacy-card--active' : ''}`}
                  onClick={!isReadOnly ? () => setIsPrivate(!isPrivate) : undefined}
                  role="button"
                  tabIndex={isReadOnly ? -1 : 0}
                  style={isReadOnly ? { cursor: 'default', opacity: 0.85 } : undefined}
                  onKeyDown={(e) => {
                    if (!isReadOnly && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setIsPrivate(!isPrivate);
                    }
                  }}
                >
                  <div className="lecturer-privacy-card__main">
                    <div className="lecturer-privacy-card__icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div className="lecturer-privacy-card__content">
                      <div className="lecturer-privacy-card__title-row">
                        <span className="lecturer-privacy-card__title">Keep Manuscript in Private Faculty Archive</span>
                        <span className={`lecturer-privacy-card__badge ${isPrivate ? 'lecturer-privacy-card__badge--private' : ''}`}>
                          {isPrivate ? 'Private Draft' : 'Standard Review Flow'}
                        </span>
                      </div>
                      <p className="lecturer-privacy-card__desc">
                        When enabled, this draft is strictly confidential to your lecturer workspace. It will not be sent to faculty review committees or visible to administrators until you decide to change visibility.
                      </p>
                    </div>
                  </div>
                  <label
                    className="lecturer-toggle-switch"
                    htmlFor="toggle-private-manuscript"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      id="toggle-private-manuscript"
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      disabled={isReadOnly}
                      className="lecturer-toggle-switch__input"
                      role="switch"
                      aria-checked={isPrivate}
                    />
                    <span className="lecturer-toggle-switch__slider" />
                  </label>
                </div>
              )}
            </div>

            {/* Sticky/Bottom Action Bar */}
            <div className="student-form-actions-bar">
              <Link href={workspacePath} className="student-btn student-btn--secondary">
                Cancel
              </Link>

              <div className="student-form-actions-right">
                {isReadOnly ? (
                  <Link
                    href={`${workspacePath}/${originalItem?.id || id}`}
                    className="student-btn student-btn--primary"
                  >
                    <span>Xem chi tiết bản thảo</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSubmit(false)}
                      disabled={isSubmitting || isAnalyzing}
                      className="student-btn student-btn--secondary"
                    >
                      {isAnalyzing ? 'Waiting for GROBID…' : isSubmitting ? 'Saving…' : 'Save as Draft'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmit(true)}
                      disabled={isSubmitting || isAnalyzing}
                      className="student-btn student-btn--primary student-btn--shimmer"
                    >
                      <span>{isAnalyzing ? 'Waiting for GROBID…' : isSubmitting ? 'Submitting…' : isRevisionMode ? 'Submit Revised Version' : 'Submit for Faculty Review'}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>

                    {devMockSubmitEnabled && (
                      <button
                        type="button"
                        onClick={() => handleSubmit(true, true)}
                        disabled={isSubmitting || isAnalyzing}
                        className="student-btn student-btn--secondary"
                        title="Development-only: bypass author account verification"
                      >
                        {isSubmitting ? 'Mock submitting…' : 'Mock submit (local)'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </PreprintWorkspaceShell>
  );
}

export default PreprintEditorView;
