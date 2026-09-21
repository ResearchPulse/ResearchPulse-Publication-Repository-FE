'use client';

import { useState, useEffect, useCallback } from 'react';

const DRAFT_STORAGE_KEY = 'hyperdata_preprint_draft_v1';

export interface PreprintDraftData {
  title: string;
  discipline: string;
  abstractText: string;
  keywordsInput: string;
  isPrivate: boolean;
  authors: Array<{
    name: string;
    email: string;
    studentId?: string;
    role: 'STUDENT' | 'LECTURER' | 'ADMIN';
    institution: string;
    isPrimary: boolean;
  }>;
}

export function usePreprintDraft() {
  const [draft, setDraft] = useState<PreprintDraftData | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        setDraft(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveDraft = useCallback((data: PreprintDraftData) => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      setDraft(data);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraft(null);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const hasSavedDraft = useCallback(() => {
    if (!draft) return false;
    return Boolean(
      draft.title?.trim() ||
      draft.abstractText?.trim() ||
      draft.discipline ||
      draft.keywordsInput?.trim() ||
      (draft.authors && draft.authors.length > 0)
    );
  }, [draft]);

  return {
    draft,
    saveDraft,
    clearDraft,
    hasSavedDraft,
  };
}
