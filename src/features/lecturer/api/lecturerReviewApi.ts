export type LecturerRecommendation = 'PUBLISH' | 'NEEDS_REVISION' | 'REJECT';

export type LecturerReview = {
  id: string;
  reviewerId: string;
  reviewer?: { id: string; name?: string | null; email: string };
  versionId?: string;
  round: number;
  comment?: string | null;
  recommendation?: LecturerRecommendation | null;
  assignmentRole?: 'PRIMARY' | 'SECONDARY' | 'LEGACY';
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LecturerPublication = {
  id: string;
  title?: string | null;
  abstract?: string | null;
  doi?: string | null;
  keywords?: string[];
  objectKey: string;
  fileSize?: number | null;
  status: 'PROCESSING' | 'DRAFTING' | 'REVIEWING' | 'PUBLISHED' | 'REJECTED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  currentVersion?: {
    id: string;
    version: number;
    versionLabel: string;
    fileName: string;
    submittedAt?: string | null;
  } | null;
  uploader?: { id: string; email: string; name?: string | null };
  authors?: Array<{ id?: string; name: string; email?: string | null; affiliation?: string | null }>;
  downloadUrl?: string;
  myReview?: LecturerReview;
};

export type LecturerVersion = {
  id: string;
  version: number;
  versionLabel: string;
  fileName: string;
  fileSize?: number | null;
  sha256?: string | null;
  changeSummary?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  isCurrent: boolean;
  downloadUrl?: string | null;
};

export type LecturerTimelineEvent = {
  id: string;
  type: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  version?: string | null;
};

export type LecturerReviewItem = LecturerPublication & {
  reviewStatus: 'AWAITING_REVIEW' | 'COMPLETED';
  myReview?: LecturerReview;
};

export type LecturerReviewDetail = {
  publication: LecturerPublication;
  reviews: LecturerReview[];
  versions: LecturerVersion[];
  timeline: LecturerTimelineEvent[];
};

type ApiResponse<T> = { success?: boolean; data?: T; message?: string; error?: { message?: string } };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/preprints${path}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({})) as ApiResponse<T>;
  if (!response.ok) throw new Error(body.error?.message || body.message || `Preprint API request failed (${response.status})`);
  if (!body.success || body.data === undefined) throw new Error('Preprint API returned an invalid response.');
  return body.data;
}

function withReviewStatus(publication: LecturerPublication, review?: LecturerReview): LecturerReviewItem {
  return {
    ...publication,
    reviewStatus: review?.submittedAt ? 'COMPLETED' : 'AWAITING_REVIEW',
    myReview: review,
  };
}

export const lecturerReviewApi = {
  async list(): Promise<{ items: LecturerReviewItem[]; total: number }> {
    const publications = await request<LecturerPublication[]>('/?status=REVIEWING&limit=50');
    const items = publications.map((publication) => withReviewStatus(publication, publication.myReview));
    return { items, total: items.length };
  },

  async get(id: string): Promise<LecturerReviewDetail> {
    const encodedId = encodeURIComponent(id);
    const [publication, reviews, versions, timeline] = await Promise.all([
      request<LecturerPublication>(`/${encodedId}`),
      request<LecturerReview[]>(`/${encodedId}/reviews`),
      request<LecturerVersion[]>(`/${encodedId}/versions`),
      request<LecturerTimelineEvent[]>(`/${encodedId}/timeline`),
    ]);
    return { publication, reviews, versions, timeline };
  },

  submit: (id: string, payload: { comment: string; recommendation: LecturerRecommendation }) =>
    request<LecturerReview>(`/${encodeURIComponent(id)}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  changeStatus: (id: string, status: 'PUBLISHED' | 'DRAFTING' | 'REJECTED', reason?: string) =>
    request<Pick<LecturerPublication, 'id' | 'title' | 'status' | 'updatedAt'>>(`/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),
};
