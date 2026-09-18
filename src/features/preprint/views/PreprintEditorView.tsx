'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { StudentShell } from '../components';
import { PreprintApiError, studentPreprintApi } from '../api';
import type { StudentPreprint } from '../types';

interface PreprintEditorViewProps {
  id?: string;
}

type UploadRetryState = {
  objectKey: string;
  fileName: string;
};

function retryStateFromError(error: unknown): UploadRetryState | null {
  if (!(error instanceof PreprintApiError) || !error.details || typeof error.details !== 'object') {
    return null;
  }

  const details = error.details as Record<string, unknown>;
  if (details.retryable !== true || typeof details.objectKey !== 'string' || typeof details.fileName !== 'string') {
    return null;
  }

  return {
    objectKey: details.objectKey,
    fileName: details.fileName,
  };
}

export function PreprintEditorView({ id }: PreprintEditorViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  // Form states
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState('Computer Science & Artificial Intelligence');
  const [abstractText, setAbstractText] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [changeSummary, setChangeSummary] = useState('');

  // Authors are extracted from the uploaded PDF. New contributors can be added
  // before submission and are sent through the metadata update endpoint.
  const [authors, setAuthors] = useState<StudentPreprint['authors']>([]);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');
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
  const [formError, setFormError] = useState<string | null>(null);
  const [originalItem, setOriginalItem] = useState<StudentPreprint | null>(null);
  const [uploadedDraftId, setUploadedDraftId] = useState<string | null>(null);
  const [retryUpload, setRetryUpload] = useState<UploadRetryState | null>(null);
  const [retryIntent, setRetryIntent] = useState<'DRAFT' | 'SUBMIT'>('SUBMIT');

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
    setRetryUpload(null);
    if (!isEditing) setUploadedDraftId(null);
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(`${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`);

    try {
      const digest = await globalThis.crypto.subtle.digest('SHA-256', await selectedFile.arrayBuffer());
      setFileHash(Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join(''));
    } catch {
      setFileHash(null);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.[0]) void handleFile(event.dataTransfer.files[0]);
  };

  const addCoAuthor = () => {
    if (!newAuthorName.trim() || !newAuthorEmail.trim()) return;
    setAuthors([
      ...authors,
      {
        name: newAuthorName.trim(),
        email: newAuthorEmail.trim(),
        institution: newAuthorInst.trim() || 'Institution unavailable',
        isPrimary: false,
      },
    ]);
    setNewAuthorName('');
    setNewAuthorEmail('');
    setNewAuthorInst('');
    setShowAddAuthor(false);
  };

  const removeCoAuthor = (index: number) => {
    setAuthors(authors.filter((_, authorIndex) => authorIndex !== index + 1));
  };

  const handleSubmit = async (submitNow: boolean) => {
    setFormError(null);
    setRetryIntent(submitNow ? 'SUBMIT' : 'DRAFT');

    if (submitNow) {
      if (!fileName) {
        setFormError('A PDF manuscript file is required before submitting for faculty review.');
        return;
      }
      if ((originalItem?.status === 'NEEDS_REVISION' || originalItem?.revision_required) && !changeSummary.trim()) {
        setFormError('Please provide a Summary of Changes addressing the reviewer comments.');
        return;
      }
    }

    const existingPublicationId = id || uploadedDraftId;
    if (!isEditing && !existingPublicationId && !file && !retryUpload) {
      setFormError('Attach a PDF manuscript before saving this draft.');
      return;
    }

    setIsSubmitting(true);
    try {
      const keywords = keywordsInput.split(',').map((keyword) => keyword.trim()).filter(Boolean);
      let publicationId = existingPublicationId || undefined;
      let uploadedPublication: StudentPreprint | null = null;

      if (!isEditing && !publicationId) {
        uploadedPublication = retryUpload
          ? await studentPreprintApi.retry(retryUpload.objectKey, retryUpload.fileName)
          : await studentPreprintApi.upload(file!);
        publicationId = uploadedPublication.id;
        setUploadedDraftId(publicationId);
        setRetryUpload(null);
        setFileName(uploadedPublication.file_name || fileName);
        setFileSize(uploadedPublication.file_size || fileSize);
        setTitle((current) => current.trim() || (uploadedPublication?.titleNeedsInput ? '' : uploadedPublication?.title || ''));
        setAbstractText((current) => current.trim() || uploadedPublication?.abstract || '');
        setKeywordsInput((current) => current.trim() || uploadedPublication?.keywords.join(', ') || '');
        setAuthors((current) => current.length > 0 ? current : uploadedPublication?.authors || []);
      }

      if (publicationId) {
        if (isEditing && file) {
          uploadedPublication = await studentPreprintApi.uploadRevision(publicationId, file, changeSummary.trim() || undefined);
          setFileName(uploadedPublication.file_name || fileName);
          setFileSize(uploadedPublication.file_size || fileSize);
          setFileHash(uploadedPublication.sha256 || fileHash);
          setRetryUpload(null);
        }

        const effectiveTitle = title.trim() || (uploadedPublication?.titleNeedsInput ? '' : uploadedPublication?.title?.trim() || '');
        if (submitNow && !effectiveTitle) {
          setFormError('GROBID could not extract a manuscript title. Please enter a title before submitting.');
          return;
        }

        const effectiveAbstract = abstractText.trim() || uploadedPublication?.abstract?.trim() || '';
        const effectiveKeywords = keywordsInput.trim() ? keywords : uploadedPublication?.keywords || keywords;
        const basePrimaryAuthor = {
          name: primaryAuthorName,
          email: primaryAuthorEmail,
          institution: primaryAuthorInst,
          isPrimary: true,
          isCorresponding: true,
        };
        const sourceAuthors = isEditing
          ? (authors.length > 0 ? authors : [basePrimaryAuthor])
          : [...(uploadedPublication?.authors?.length ? uploadedPublication.authors : [basePrimaryAuthor]), ...authors];
        const uniqueAuthors = sourceAuthors.filter((author, index, list) => (
          list.findIndex((candidate) => (
            (candidate.email && author.email && candidate.email === author.email)
              || candidate.name.toLowerCase() === author.name.toLowerCase()
          )) === index
        ));

        await studentPreprintApi.update(publicationId, {
          ...(effectiveTitle ? { title: effectiveTitle } : {}),
          ...(effectiveAbstract ? { abstract: effectiveAbstract } : {}),
          keywords: effectiveKeywords,
          ...(uniqueAuthors.length > 0
            ? { authors: uniqueAuthors.map((author, index) => ({
              name: author.name,
              email: author.email || undefined,
              affiliation: author.institution || undefined,
              orderIndex: index,
            })) }
            : {}),
        });
        if (submitNow) await studentPreprintApi.submit(publicationId);
      }

      router.push(publicationId ? `/student/my-preprints/${publicationId}` : '/student/my-preprints');
      router.refresh();
    } catch (error) {
      const retryInfo = retryStateFromError(error);
      if (retryInfo) {
        setRetryUpload(retryInfo);
        setFormError(`${error instanceof Error ? error.message : 'Publication processing failed.'} The PDF is already stored; retry processing without uploading it again.`);
      } else {
        setFormError(error instanceof Error ? error.message : 'An error occurred while saving the preprint.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRevisionMode = originalItem?.status === 'NEEDS_REVISION' || originalItem?.revision_required === true;
  const latestReview = originalItem?.reviews?.[0];

  const primaryAuthorName = originalItem?.authors?.[0]?.name || user?.name || user?.email?.split('@')[0] || 'Logged-in Student';
  const primaryAuthorEmail = originalItem?.authors?.[0]?.email || user?.email || 'student@university.edu.vn';
  const primaryAuthorInst = originalItem?.authors?.[0]?.institution || 'University Research Faculty';
  const primaryInitials = primaryAuthorName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST';

  return (
    <StudentShell
      title={isRevisionMode ? `Revise Manuscript: v${Number((originalItem?.current_version || 1) + 0.1).toFixed(1)}` : isEditing ? 'Edit Manuscript Draft' : 'Start a New Preprint'}
      kicker={isRevisionMode ? 'Revision Submission' : 'Manuscript Registration'}
    >
      {loadingInitial ? (
        <div className="student-loading-box">
          <div className="student-spinner" />
          <p>Loading manuscript details…</p>
        </div>
      ) : (
        <div className="student-editor-container">
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
              {retryUpload && (
                <button
                  type="button"
                  className="student-btn student-btn--secondary student-error-banner__retry"
                  onClick={() => void handleSubmit(retryIntent === 'SUBMIT')}
                  disabled={isSubmitting}
                >
                  Retry processing
                </button>
              )}
            </div>
          )}

          <form
            className="student-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(false);
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
                    {primaryAuthorEmail} • {primaryAuthorInst}
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
                    <span className="student-author-meta">{ca.email} • {ca.institution}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCoAuthor(idx)}
                    className="student-author-remove"
                    title="Remove author"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add Co-author Box */}
              {showAddAuthor ? (
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
                      placeholder="University Email"
                      value={newAuthorEmail}
                      onChange={(e) => setNewAuthorEmail(e.target.value)}
                    />
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
              )}
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
              {fileName ? (
                <div className="student-extraction-notice student-extraction-notice--success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>
                    <strong>GROBID extraction ready:</strong> PDF <em>{fileName}</em> is selected. Review or edit the extracted metadata below before proceeding.
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
                    <strong>Waiting for PDF upload:</strong> Attach your manuscript in Step 01 to automatically parse title, abstract, and keywords via GROBID, or enter them manually below.
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
                />
              </div>

              <div className="student-field">
                <label htmlFor="field-discipline" className="student-field__label">
                  Research Discipline / Field <span className="student-required">*</span>
                </label>
                <select
                  id="field-discipline"
                  className="student-select"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                >
                  <option value="Computer Science & Artificial Intelligence">Computer Science & Artificial Intelligence</option>
                  <option value="Information Technology & Software Engineering">Information Technology & Software Engineering</option>
                  <option value="Data Science & Machine Learning">Data Science & Machine Learning</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                  <option value="Mathematics & Applied Statistics">Mathematics & Applied Statistics</option>
                  <option value="Physics & Materials Science">Physics & Materials Science</option>
                  <option value="Biological & Medical Sciences">Biological & Medical Sciences</option>
                  <option value="Environmental & Earth Sciences">Environmental & Earth Sciences</option>
                  <option value="Social Sciences & Economics">Social Sciences & Economics</option>
                  <option value="Interdisciplinary Scientific Research">Interdisciplinary Scientific Research</option>
                </select>
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
                />
              </div>
            </div>

            {/* Sticky/Bottom Action Bar */}
            <div className="student-form-actions-bar">
              <Link href="/student/my-preprints" className="student-btn student-btn--secondary">
                Cancel
              </Link>

              <div className="student-form-actions-right">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="student-btn student-btn--secondary"
                >
                  {isSubmitting ? 'Saving…' : 'Save as Draft'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="student-btn student-btn--primary student-btn--shimmer"
                >
                  <span>{isSubmitting ? 'Submitting…' : isRevisionMode ? 'Submit Revised Version' : 'Submit for Faculty Review'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </StudentShell>
  );
}

export default PreprintEditorView;
