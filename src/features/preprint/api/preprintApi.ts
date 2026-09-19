import type { StudentPreprint, PreprintVersionInfo, ReviewNote, PreprintAnalysis } from '../types';

export class ApiUnavailableError extends Error {
  code = 'API_NOT_AVAILABLE' as const;
}

export class PreprintApiError extends Error {
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'PreprintApiError';
    this.code = code;
    this.details = details;
  }
}

type BackendPublicationStatus = 'PROCESSING' | 'DRAFTING' | 'REVIEWING' | 'PUBLISHED' | 'REJECTED' | 'FAILED';
type BackendVersionStatus = BackendPublicationStatus | 'ARCHIVED';

type BackendAuthor = {
  id?: string;
  name: string;
  email?: string | null;
  studentId?: string | null;
  role?: 'STUDENT' | 'LECTURER' | 'ADMIN';
  userId?: string | null;
  affiliation?: string | null;
  orderIndex?: number;
};

type BackendReview = {
  id: string;
  versionId?: string;
  reviewerId: string;
  comment?: string | null;
  recommendation?: 'PUBLISH' | 'NEEDS_REVISION' | 'REJECT' | null;
  submittedAt?: string | null;
  createdAt: string;
  reviewer?: { id: string; email: string; name?: string | null };
};

type BackendVersion = {
  id: string;
  publicationId: string;
  version: number;
  versionLabel: string;
  title?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationDate?: string | null;
  discipline?: string | null;
  keywords?: string[];
  fileName: string;
  fileSize?: number | null;
  sha256?: string | null;
  changeSummary?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  status: BackendVersionStatus;
  isCurrent: boolean;
  downloadUrl?: string | null;
  authors?: BackendAuthor[];
};

type BackendTimelineEvent = {
  id: string;
  type: 'DRAFT_CREATED' | 'FILE_UPLOADED' | 'SUBMITTED' | 'REVIEW_SUBMITTED' | 'REJECTED' | 'REOPENED' | 'PUBLISHED';
  title: string;
  description: string;
  actor: string;
  actorId?: string | null;
  version?: string | null;
  timestamp: string;
};

type BackendPublication = {
  id: string;
  title?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationDate?: string | null;
  discipline?: string | null;
  keywords: string[];
  objectKey: string;
  fileSize?: number | null;
  sha256?: string | null;
  currentVersion?: {
    id: string;
    version: number;
    versionLabel: string;
    fileName: string;
    submittedAt?: string | null;
  } | null;
  status: BackendPublicationStatus;
  audiences?: Array<'GUEST' | 'STUDENT' | 'LECTURER'>;
  isPrivate?: boolean;
  authors?: BackendAuthor[];
  uploader?: { id: string; email: string; name?: string | null };
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
};

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return undefined;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileNameFromObjectKey(objectKey?: string) {
  if (!objectKey) return undefined;
  return objectKey.split('/').pop() || objectKey;
}

function mapStatus(status: BackendPublicationStatus): StudentPreprint['status'] {
  switch (status) {
    case 'DRAFTING':
      return 'DRAFT';
    case 'REVIEWING':
      return 'UNDER_REVIEW';
    case 'PUBLISHED':
      return 'PUBLISHED';
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'DRAFT';
  }
}

function mapVersionStatus(status: BackendVersionStatus): PreprintVersionInfo['status'] {
  return status === 'ARCHIVED' ? 'ARCHIVED' : mapStatus(status);
}

function mapReview(review: BackendReview): ReviewNote {
  const decision = review.recommendation === 'NEEDS_REVISION'
    ? 'NEEDS_REVISION'
    : review.recommendation === 'REJECT'
      ? 'REJECTED'
      : 'APPROVED';

  return {
    id: review.id,
    reviewer_name: review.reviewer?.name || review.reviewer?.email || 'Lecturer Reviewer',
    reviewer_title: 'Lecturer Reviewer',
    decision,
    comments: review.comment || '',
    created_at: review.submittedAt || review.createdAt,
  };
}

function mapAnalysis(analysis: {
  title?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationDate?: string | null;
  keywords: string[];
  authors: Array<BackendAuthor & {
    verification?: {
      status: 'VERIFIED' | 'UNREGISTERED' | 'MISSING_IDENTIFIER' | 'INACTIVE';
      reason?: string;
      user?: { id: string };
    };
  }>;
}): PreprintAnalysis {
  return {
    title: analysis.title,
    abstract: analysis.abstract,
    doi: analysis.doi,
    publicationDate: analysis.publicationDate,
    keywords: [],
    authors: analysis.authors.map((author, index) => ({
      name: author.name,
      email: author.email || '',
      studentId: author.studentId || undefined,
      role: author.role || 'STUDENT',
      userId: author.userId || author.verification?.user?.id,
      verificationStatus: author.verification?.status,
      verificationReason: author.verification?.reason,
      institution: author.affiliation || '',
      isPrimary: index === 0,
      isCorresponding: index === 0,
    })),
  };
}

function mapVersion(version: BackendVersion): PreprintVersionInfo {
  return {
    version: version.version,
    version_label: version.versionLabel,
    created_at: version.createdAt,
    change_summary: version.changeSummary || undefined,
    file_name: version.fileName,
    file_size: formatFileSize(version.fileSize) || 'Size unavailable',
    sha256: version.sha256 || undefined,
    status: mapVersionStatus(version.status),
    is_current: version.isCurrent,
    submitted_at: version.submittedAt || undefined,
    download_url: version.downloadUrl || undefined,
    authors: (version.authors || []).map((author, index) => ({
      name: author.name,
      email: author.email || '',
      studentId: author.studentId || undefined,
      role: author.role,
      userId: author.userId || undefined,
      institution: author.affiliation || '',
      isPrimary: index === 0,
      isCorresponding: index === 0,
    })),
  };
}

function normalizePublication(
  publication: BackendPublication,
  reviews: BackendReview[] = [],
  versions: BackendVersion[] = [],
  timeline: BackendTimelineEvent[] = [],
): StudentPreprint {
  const currentVersion = publication.currentVersion?.version || versions.find((version) => version.isCurrent)?.version || 1;
  const allReviews = reviews.length > 0 ? reviews : ((publication as any).reviews || []);
  const hasNeedsRevision = allReviews.some((r: any) => r.recommendation === 'NEEDS_REVISION' || r.decision === 'NEEDS_REVISION');
  const isDraftWithSubmission = publication.status === 'DRAFTING' && Boolean(publication.currentVersion?.submittedAt);
  const revisionRequired = isDraftWithSubmission || hasNeedsRevision;

  let status: StudentPreprint['status'] = mapStatus(publication.status);
  if (hasNeedsRevision || isDraftWithSubmission) {
    status = 'NEEDS_REVISION';
  }

  return {
    id: publication.id,
    title: publication.title || fileNameFromObjectKey(publication.objectKey) || 'Untitled manuscript',
    titleNeedsInput: !publication.title?.trim(),
    abstract: publication.abstract || undefined,
    discipline: publication.discipline || '',
    keywords: publication.keywords || [],
    audiences: publication.audiences || [],
    is_private: publication.isPrivate || false,
    status,
    current_version: currentVersion,
    revision_required: revisionRequired,
    authors: (publication.authors || []).map((author, index) => ({
      name: author.name,
      email: author.email || '',
      studentId: author.studentId || undefined,
      role: author.role,
      userId: author.userId || undefined,
      institution: author.affiliation || '',
      isPrimary: index === 0,
      isCorresponding: index === 0,
    })),
    file_name: publication.currentVersion?.fileName || fileNameFromObjectKey(publication.objectKey),
    file_size: formatFileSize(publication.fileSize),
    sha256: publication.sha256 || undefined,
    doi: publication.doi || undefined,
    download_url: publication.downloadUrl,
    updated_at: publication.updatedAt,
    submitted_at: publication.status === 'DRAFTING' ? undefined : publication.updatedAt,
    reviews: reviews.map(mapReview),
    timeline: timeline.map((event) => ({
      id: event.id,
      type: event.type,
      title: event.title,
      description: event.description,
      actor: event.actor,
      timestamp: event.timestamp,
      version: event.version,
    })),
    versions: versions.map(mapVersion),
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && typeof FormData !== 'undefined' && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch('/api/preprints' + path, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers,
  });

  const body = await response.json().catch(() => null) as {
    success?: boolean;
    data?: T;
    code?: string;
    message?: string;
    error?: { code?: string; message?: string; details?: unknown };
  } | null;
  const message = body?.error?.message
    ? body.error.message
    : body?.message
      || `Preprint API request failed: ${response.status}`;
  const code = body?.code || body?.error?.code;
  const details = body?.error?.details;

  if (response.status === 501 || code === 'API_NOT_AVAILABLE') {
    throw new ApiUnavailableError(message || 'Preprint API is not available.');
  }
  if (!response.ok) throw new PreprintApiError(message, code, details);
  if (!body || !body.success) {
    throw new Error('Preprint API returned an invalid response.');
  }
  return body.data as T;
}

export const studentPreprintApi = {
  listMine: async (): Promise<{ items: StudentPreprint[] }> => {
    const publications = await request<BackendPublication[]>('/?mine=true');
    return { items: publications.map((publication) => normalizePublication(publication, (publication as any).reviews || [])) };
  },

  get: async (id: string): Promise<StudentPreprint> => {
    const encodedId = encodeURIComponent(id);
    const [publication, reviews, versions, timeline] = await Promise.all([
      request<BackendPublication>('/' + encodedId),
      request<BackendReview[]>('/' + encodedId + '/reviews'),
      request<BackendVersion[]>('/' + encodedId + '/versions'),
      request<BackendTimelineEvent[]>('/' + encodedId + '/timeline'),
    ]);
    return normalizePublication(publication, reviews, versions, timeline);
  },

  analyze: async (file: File): Promise<PreprintAnalysis> => {
    const formData = new FormData();
    formData.append('file', file);
    const analysis = await request<Parameters<typeof mapAnalysis>[0]>('/analyze', {
      method: 'POST',
      body: formData,
    });
    return mapAnalysis(analysis);
  },

  upload: async (
    file: File,
    intent: 'DRAFT' | 'SUBMIT',
    metadata: {
      title?: string;
      abstract?: string;
      doi?: string;
      publicationDate?: string;
      discipline?: string;
      keywords: string[];
      isPrivate?: boolean;
      authors: Array<{
        name: string;
        email?: string;
        studentId?: string;
        role?: 'STUDENT' | 'LECTURER' | 'ADMIN';
        affiliation?: string;
        orderIndex?: number;
      }>;
    },
  ): Promise<StudentPreprint> => {
    const formData = new FormData();
    formData.append('intent', intent);
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('file', file);
    const publication = await request<BackendPublication>('/upload-direct', {
      method: 'POST',
      body: formData,
    });
    return normalizePublication(publication);
  },

  uploadRevision: async (id: string, file: File, changeSummary?: string): Promise<StudentPreprint> => {
    const formData = new FormData();
    if (changeSummary?.trim()) formData.append('changeSummary', changeSummary.trim());
    formData.append('file', file);
    const publication = await request<BackendPublication>('/' + encodeURIComponent(id) + '/revisions/upload-direct', {
      method: 'POST',
      body: formData,
    });
    return normalizePublication(publication);
  },

  retry: async (objectKey: string, fileName: string): Promise<StudentPreprint> => {
    const publication = await request<BackendPublication>('/process', {
      method: 'POST',
      body: JSON.stringify({ objectKey, fileName }),
    });
    return normalizePublication(publication);
  },

  update: async (
    id: string,
    payload: {
      title?: string;
      abstract?: string;
      doi?: string;
      publicationDate?: string;
      discipline?: string;
      keywords?: string[];
      authors?: Array<{ name: string; email?: string; studentId?: string; role?: 'STUDENT' | 'LECTURER' | 'ADMIN'; affiliation?: string; orderIndex?: number }>;
    }
  ): Promise<StudentPreprint> => {
    const publication = await request<BackendPublication>('/' + encodeURIComponent(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizePublication(publication);
  },

  submit: async (id: string): Promise<StudentPreprint> => {
    await request(`/` + encodeURIComponent(id) + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REVIEWING' }),
    });
    return studentPreprintApi.get(id);
  },

  mockSubmit: async (id: string): Promise<StudentPreprint> => {
    await request(`/` + encodeURIComponent(id) + '/dev-submit', {
      method: 'POST',
    });
    return studentPreprintApi.get(id);
  },

  versions: async (id: string): Promise<PreprintVersionInfo[]> => {
    const versions = await request<BackendVersion[]>('/' + encodeURIComponent(id) + '/versions');
    return versions.map(mapVersion);
  },

  timeline: async (id: string): Promise<StudentPreprint['timeline']> => {
    const timeline = await request<BackendTimelineEvent[]>('/' + encodeURIComponent(id) + '/timeline');
    return timeline.map((event) => ({
      id: event.id,
      type: event.type,
      title: event.title,
      description: event.description,
      actor: event.actor,
      timestamp: event.timestamp,
      version: event.version,
    }));
  },
};

export default studentPreprintApi;
