import type { StudentPreprint, PreprintVersionInfo, ReviewNote, TimelineEvent } from '../types';

const STORAGE_KEY = 'hyperdata_student_preprints_v1';

const SEED_PREPRINTS: StudentPreprint[] = [
  {
    id: 'manuscript-stem-01',
    title: 'Mapping data literacy in undergraduate STEM research',
    abstract: 'This empirical study explores curriculum interventions designed to enhance empirical data verification and statistical integrity across undergraduate STEM coursework in Vietnamese higher education. We present quantitative results from a 3-semester trial spanning 450 participants, demonstrating a 42% decrease in statistical reporting discrepancies and elevated student agency in peer-review exercises.',
    discipline: 'Computer Science',
    keywords: ['Data Literacy', 'STEM Education', 'Statistical Integrity', 'Peer Review'],
    status: 'APPROVED',
    current_version: 2,
    authors: [
      { name: 'Nguyen Minh An', email: 'an.nguyen@student.hcmut.edu.vn', institution: 'VNU-HCM University of Technology', isPrimary: true, isCorresponding: true },
      { name: 'Le Van Binh', email: 'binh.le@student.hcmut.edu.vn', institution: 'VNU-HCM University of Technology' },
    ],
    supervisor: 'Prof. Dang Quang Minh',
    file_name: 'stem_data_literacy_v2.0_final.pdf',
    file_size: '2.4 MB',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    doi: '10.5281/zenodo.hdl-7821',
    submitted_at: '2026-08-28T09:30:00Z',
    updated_at: '2026-09-12T14:15:00Z',
    reviews: [
      {
        id: 'rev-01',
        reviewer_name: 'Dr. Linh Tran',
        reviewer_title: 'Advisory Board Chair & Senior Faculty',
        decision: 'APPROVED',
        comments: 'Excellent revisions on Section 3.2. The additional statistical validation tests with confidence intervals address all previous methodological concerns. The paper is ready for public repository archiving and external conference submission.',
        recommendations: [
          'Add dataset repository link to final camera-ready footer',
          'Ensure all figures are exported at 300 DPI for conference printing',
        ],
        created_at: '2026-09-12T14:10:00Z',
      },
    ],
    timeline: [
      {
        id: 't-1',
        type: 'DRAFT_CREATED',
        title: 'Initial Draft Created',
        description: 'Manuscript draft initialized with title and abstract.',
        actor: 'Nguyen Minh An',
        timestamp: '2026-08-25T10:00:00Z',
      },
      {
        id: 't-2',
        type: 'FILE_UPLOADED',
        title: 'Manuscript PDF Attached',
        description: 'Version 1.0 uploaded with SHA-256 timestamping.',
        actor: 'Nguyen Minh An',
        timestamp: '2026-08-28T09:15:00Z',
      },
      {
        id: 't-3',
        type: 'SUBMITTED',
        title: 'Submitted for Review',
        description: 'Manuscript submitted to Faculty Mentorship queue.',
        actor: 'Nguyen Minh An',
        timestamp: '2026-08-28T09:30:00Z',
      },
      {
        id: 't-4',
        type: 'ASSIGNED',
        title: 'Faculty Mentor Assigned',
        description: 'Dr. Linh Tran assigned as lead advisory reviewer.',
        actor: 'Repository Coordinator',
        timestamp: '2026-08-29T08:00:00Z',
      },
      {
        id: 't-5',
        type: 'REVISION_REQUESTED',
        title: 'Revision Requested (v1.0)',
        description: 'Reviewer requested supplementary statistical tests.',
        actor: 'Dr. Linh Tran',
        timestamp: '2026-09-05T16:20:00Z',
      },
      {
        id: 't-6',
        type: 'SUBMITTED',
        title: 'Revised Version 2.0 Submitted',
        description: 'Updated draft with ANOVA verification table and revisions summary.',
        actor: 'Nguyen Minh An',
        timestamp: '2026-09-10T11:00:00Z',
      },
      {
        id: 't-7',
        type: 'APPROVED',
        title: 'Manuscript Approved & Timestamp Verified',
        description: 'Faculty review completed with recommendation for open archiving.',
        actor: 'Dr. Linh Tran',
        timestamp: '2026-09-12T14:15:00Z',
      },
    ],
    versions: [
      {
        version: 2,
        version_label: 'v2.0',
        created_at: '2026-09-10T11:00:00Z',
        change_summary: 'Incorporated two-way ANOVA analysis, updated Figure 4 with confidence intervals, and refined abstract.',
        file_name: 'stem_data_literacy_v2.0_final.pdf',
        file_size: '2.4 MB',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        status: 'APPROVED',
      },
      {
        version: 1,
        version_label: 'v1.0',
        created_at: '2026-08-28T09:15:00Z',
        change_summary: 'Initial preprint release version submitted for faculty mentorship review.',
        file_name: 'stem_data_literacy_v1.0.pdf',
        file_size: '2.1 MB',
        sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        status: 'NEEDS_REVISION',
      },
    ],
  },
  {
    id: 'manuscript-workflow-02',
    title: 'A reproducible workflow framework for laboratory notebooks',
    abstract: 'Electronic lab notebooks frequently suffer from data silos and non-interoperable export formats. We introduce a standardized, version-controlled notebook framework built on cryptographic commit hashing, lightweight Markdown schemas, and automated schema validation for student lab groups.',
    discipline: 'Open Methods',
    keywords: ['Reproducibility', 'Electronic Lab Notebooks', 'Git Workflow', 'Open Science'],
    status: 'NEEDS_REVISION',
    current_version: 1.2,
    authors: [
      { name: 'Nguyen Minh An', email: 'an.nguyen@student.hcmut.edu.vn', institution: 'VNU-HCM University of Technology', isPrimary: true, isCorresponding: true },
      { name: 'Tran Gia Huy', email: 'huy.tran@student.uit.edu.vn', institution: 'VNU-HCM University of Information Technology' },
    ],
    supervisor: 'Dr. Linh Tran',
    file_name: 'lab_notebook_workflow_v1.2.pdf',
    file_size: '3.1 MB',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    doi: '10.5281/zenodo.hdl-6402-preview',
    submitted_at: '2026-09-02T15:45:00Z',
    updated_at: '2026-09-14T10:00:00Z',
    reviews: [
      {
        id: 'rev-02',
        reviewer_name: 'Dr. Linh Tran',
        reviewer_title: 'Advisory Reviewer',
        decision: 'NEEDS_REVISION',
        comments: 'The proposed protocol is promising and clearly laid out. However, please address the following before formal preprint approval: 1) Clarify handling of binary assets (>50MB) within the git hook architecture; 2) Add a comparison table against Benchling and JupyterLab protocols; 3) Provide benchmark timing figures on cross-platform operating systems.',
        recommendations: [
          'Detail LFS (Large File Storage) fallback mechanism in Section 4.1',
          'Add comparison matrix in Table 2',
          'Provide test scripts repository link in Appendix A',
        ],
        created_at: '2026-09-14T09:45:00Z',
      },
    ],
    timeline: [
      {
        id: 't-201',
        type: 'DRAFT_CREATED',
        title: 'Draft Created',
        description: 'New manuscript draft registered.',
        actor: 'Nguyen Minh An',
        timestamp: '2026-08-30T14:00:00Z',
      },
      {
        id: 't-202',
        type: 'SUBMITTED',
        title: 'Submitted for Review',
        description: 'Submitted to Faculty Mentorship board.',
        actor: 'Nguyen Minh An',
        timestamp: '2026-09-02T15:45:00Z',
      },
      {
        id: 't-203',
        type: 'ASSIGNED',
        title: 'Reviewer Assigned',
        description: 'Dr. Linh Tran assigned for methodological review.',
        actor: 'Editorial Office',
        timestamp: '2026-09-03T08:30:00Z',
      },
      {
        id: 't-204',
        type: 'REVISION_REQUESTED',
        title: 'Revision Requested by Reviewer',
        description: 'Clarifications needed on large binary asset storage and OS compatibility.',
        actor: 'Dr. Linh Tran',
        timestamp: '2026-09-14T09:45:00Z',
      },
    ],
    versions: [
      {
        version: 1.2,
        version_label: 'v1.2',
        created_at: '2026-09-02T15:45:00Z',
        change_summary: 'Added preliminary CLI benchmark metrics.',
        file_name: 'lab_notebook_workflow_v1.2.pdf',
        file_size: '3.1 MB',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        status: 'NEEDS_REVISION',
      },
      {
        version: 1.0,
        version_label: 'v1.0',
        created_at: '2026-08-30T14:00:00Z',
        change_summary: 'Initial outline submission.',
        file_name: 'lab_notebook_workflow_v1.0.pdf',
        file_size: '2.8 MB',
        status: 'DRAFT',
      },
    ],
  },
  {
    id: 'manuscript-peerreview-03',
    title: 'Collaborative peer review practices in student academic journals',
    abstract: 'Student-run academic publications provide crucial formative feedback for budding scientists, yet structured rubrics and mentor verification are rarely standardized. We propose an open rubric system combining double-blind rubric evaluation with faculty sign-off milestones.',
    discipline: 'Research Integrity',
    keywords: ['Peer Review', 'Academic Publishing', 'Research Ethics', 'Student Mentorship'],
    status: 'UNDER_REVIEW',
    current_version: 1,
    authors: [
      { name: 'Nguyen Minh An', email: 'an.nguyen@student.hcmut.edu.vn', institution: 'VNU-HCM University of Technology', isPrimary: true, isCorresponding: true },
      { name: 'Le Ha My', email: 'my.le@hust.edu.vn', institution: 'Hanoi University of Science and Technology (HUST)' },
    ],
    supervisor: 'Assoc. Prof. Nguyen Van Thuan',
    file_name: 'student_peer_review_v1.0.pdf',
    file_size: '1.8 MB',
    sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    doi: '10.5281/zenodo.hdl-5192-preview',
    submitted_at: '2026-09-15T08:00:00Z',
    updated_at: '2026-09-15T08:00:00Z',
    reviews: [],
    timeline: [
      {
        id: 't-301',
        type: 'DRAFT_CREATED',
        title: 'Draft Initialized',
        description: 'Draft created with co-author Le Ha My (HUST).',
        actor: 'Nguyen Minh An',
        timestamp: '2026-09-14T16:00:00Z',
      },
      {
        id: 't-302',
        type: 'FILE_UPLOADED',
        title: 'Manuscript File Uploaded',
        description: 'Uploaded student_peer_review_v1.0.pdf (1.8 MB).',
        actor: 'Nguyen Minh An',
        timestamp: '2026-09-15T07:45:00Z',
      },
      {
        id: 't-303',
        type: 'SUBMITTED',
        title: 'Submitted for Faculty Mentorship',
        description: 'Assigned to editorial queue for initial scope check.',
        actor: 'Nguyen Minh An',
        timestamp: '2026-09-15T08:00:00Z',
      },
    ],
    versions: [
      {
        version: 1,
        version_label: 'v1.0',
        created_at: '2026-09-15T08:00:00Z',
        change_summary: 'First complete draft submitted for review.',
        file_name: 'student_peer_review_v1.0.pdf',
        file_size: '1.8 MB',
        sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
        status: 'UNDER_REVIEW',
      },
    ],
  },
];

class StudentPreprintMockService {
  private getStorage(): StudentPreprint[] {
    if (typeof window === 'undefined') return SEED_PREPRINTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PREPRINTS));
        return SEED_PREPRINTS;
      }
      return JSON.parse(raw);
    } catch {
      return SEED_PREPRINTS;
    }
  }

  private saveStorage(items: StudentPreprint[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage quota errors in demo mode
    }
  }

  async listMine(): Promise<{ items: StudentPreprint[] }> {
    await new Promise((r) => setTimeout(r, 120));
    return { items: this.getStorage() };
  }

  async get(id: string): Promise<StudentPreprint> {
    await new Promise((r) => setTimeout(r, 100));
    const items = this.getStorage();
    const found = items.find((i) => i.id === id);
    if (!found) throw new Error('Manuscript not found.');
    return found;
  }

  async create(payload: {
    title: string;
    abstract: string;
    discipline?: string;
    keywords?: string[];
    supervisor?: string;
    file_name?: string;
    file_size?: string;
    authors?: Array<{ name: string; email: string; institution: string }>;
    submitNow?: boolean;
  }): Promise<StudentPreprint> {
    await new Promise((r) => setTimeout(r, 200));
    const items = this.getStorage();
    const id = 'manuscript-' + Date.now().toString(36);
    const now = new Date().toISOString();
    const status = payload.submitNow ? 'SUBMITTED' : 'DRAFT';

    const newManuscript: StudentPreprint = {
      id,
      title: payload.title,
      abstract: payload.abstract,
      discipline: payload.discipline || 'Computer Science',
      keywords: payload.keywords || [],
      status,
      current_version: 1,
      authors: [
        {
          name: 'Nguyen Minh An',
          email: 'an.nguyen@student.hcmut.edu.vn',
          institution: 'VNU-HCM University of Technology',
          isPrimary: true,
          isCorresponding: true,
        },
        ...(payload.authors || []),
      ],
      supervisor: payload.supervisor || 'Dr. Linh Tran',
      file_name: payload.file_name || (payload.submitNow ? 'manuscript_draft.pdf' : undefined),
      file_size: payload.file_size || (payload.submitNow ? '2.5 MB' : undefined),
      sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      doi: '10.5281/zenodo.hdl-' + Math.floor(1000 + Math.random() * 9000) + '-preview',
      submitted_at: payload.submitNow ? now : undefined,
      updated_at: now,
      reviews: [],
      timeline: [
        {
          id: 'tl-' + Date.now(),
          type: 'DRAFT_CREATED',
          title: 'Draft Created',
          description: 'Initial draft initialized by author.',
          actor: 'Nguyen Minh An',
          timestamp: now,
        },
        ...(payload.submitNow
          ? [
              {
                id: 'tl-sub-' + Date.now(),
                type: 'SUBMITTED' as const,
                title: 'Submitted for Faculty Mentorship',
                description: 'Manuscript queued for faculty evaluation.',
                actor: 'Nguyen Minh An',
                timestamp: now,
              },
            ]
          : []),
      ],
      versions: [
        {
          version: 1,
          version_label: 'v1.0',
          created_at: now,
          change_summary: 'Initial release',
          file_name: payload.file_name || 'draft.pdf',
          file_size: payload.file_size || '1.0 MB',
          status,
        },
      ],
    };

    const nextList = [newManuscript, ...items];
    this.saveStorage(nextList);
    return newManuscript;
  }

  async update(
    id: string,
    payload: {
      title?: string;
      abstract?: string;
      discipline?: string;
      keywords?: string[];
      supervisor?: string;
      file_name?: string;
      file_size?: string;
      change_summary?: string;
      submitRevision?: boolean;
    }
  ): Promise<StudentPreprint> {
    await new Promise((r) => setTimeout(r, 180));
    const items = this.getStorage();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Manuscript not found.');

    const current = items[index];
    const now = new Date().toISOString();
    const isRevision = payload.submitRevision && current.status === 'NEEDS_REVISION';
    const nextVersion = isRevision ? Number((current.current_version + 0.1).toFixed(1)) : current.current_version;
    const nextStatus = isRevision ? 'UNDER_REVIEW' : current.status;

    const updatedTimeline: TimelineEvent[] = [...(current.timeline || [])];
    if (isRevision) {
      updatedTimeline.push({
        id: 'tl-rev-' + Date.now(),
        type: 'SUBMITTED',
        title: `Revision v${nextVersion} Submitted`,
        description: payload.change_summary || 'Author submitted revised draft addressing reviewer comments.',
        actor: 'Nguyen Minh An',
        timestamp: now,
      });
    }

    const updatedVersions: PreprintVersionInfo[] = [...(current.versions || [])];
    if (isRevision) {
      updatedVersions.unshift({
        version: nextVersion,
        version_label: `v${nextVersion}`,
        created_at: now,
        change_summary: payload.change_summary || 'Addressed reviewer revision feedback.',
        file_name: payload.file_name || current.file_name || 'manuscript_revised.pdf',
        file_size: payload.file_size || current.file_size || '2.8 MB',
        sha256: 'c8d9e0f123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        status: 'UNDER_REVIEW',
      });
    }

    const updated: StudentPreprint = {
      ...current,
      title: payload.title ?? current.title,
      abstract: payload.abstract ?? current.abstract,
      discipline: payload.discipline ?? current.discipline,
      keywords: payload.keywords ?? current.keywords,
      supervisor: payload.supervisor ?? current.supervisor,
      file_name: payload.file_name ?? current.file_name,
      file_size: payload.file_size ?? current.file_size,
      status: nextStatus,
      current_version: nextVersion,
      updated_at: now,
      timeline: updatedTimeline,
      versions: updatedVersions,
    };

    items[index] = updated;
    this.saveStorage(items);
    return updated;
  }

  async submit(id: string): Promise<StudentPreprint> {
    return this.update(id, { submitRevision: true });
  }

  async withdraw(id: string): Promise<StudentPreprint> {
    await new Promise((r) => setTimeout(r, 150));
    const items = this.getStorage();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Manuscript not found.');
    const now = new Date().toISOString();
    items[index] = {
      ...items[index],
      status: 'WITHDRAWN',
      updated_at: now,
      timeline: [
        ...(items[index].timeline || []),
        {
          id: 'tl-wth-' + Date.now(),
          type: 'SUBMITTED',
          title: 'Manuscript Withdrawn by Author',
          description: 'Author formally withdrew the manuscript from review.',
          actor: 'Nguyen Minh An',
          timestamp: now,
        },
      ],
    };
    this.saveStorage(items);
    return items[index];
  }

  async versions(id: string): Promise<PreprintVersionInfo[]> {
    const item = await this.get(id);
    return item.versions || [];
  }

  resetSeedData() {
    this.saveStorage(SEED_PREPRINTS);
  }
}

export const studentPreprintMock = new StudentPreprintMockService();
export default studentPreprintMock;
