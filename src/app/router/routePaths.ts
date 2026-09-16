/**
 * Centralized routes for the Public FE.
 */
export const ROUTES = {
  HOME: '/',
  FORBIDDEN: '/forbidden',
  REGISTER: '/register',
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    CALLBACK: '/auth/callback',
  },
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    SUBMISSIONS: '/admin/submissions',
    SUBMISSION_DETAIL: (id: string | number) => `/admin/submissions/${id}`,
    REVIEWS: '/admin/reviews',
  },
  STUDENT: {
    ROOT: '/student',
    PREPRINTS: '/student/my-preprints',
    NEW_PREPRINT: '/student/my-preprints/new',
    PREPRINT_DETAIL: (id: string | number) => `/student/my-preprints/${id}`,
  },
} as const;

export default ROUTES;
