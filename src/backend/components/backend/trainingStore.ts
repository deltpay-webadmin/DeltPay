/**
 * ────────────────────────────────────────────────────────────
 * Training progress store — who has passed which lesson
 * ────────────────────────────────────────────────────────────
 * Rows live in training_progress (RLS: own rows; ops can read all for
 * certification reporting). Offline/demo mode falls back to localStorage so
 * the Training page still works end to end without Supabase.
 */

import { useSyncExternalStore } from 'react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';

const LOCAL_KEY = 'delt-training-progress';

interface TrainingState {
  /** lesson_id → passing score (0–1). */
  completed: Record<string, number>;
  isLoading: boolean;
}

function loadLocal(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

let state: TrainingState = { completed: {}, isLoading: true };
const listeners = new Set<() => void>();

function set(patch: Partial<TrainingState>) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}

let hydrated = false;
let hydrating = false;

async function maybeHydrate() {
  if (hydrated || hydrating) return;
  if (!supabase) {
    hydrated = true;
    set({ completed: loadLocal(), isLoading: false });
    return;
  }
  hydrating = true;
  try {
    // RLS scopes this to the signed-in user (ops also sees others' rows, but
    // the page only renders the caller's own ids).
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes?.user?.id;
    const query = supabase.from('training_progress').select('lesson_id, score, user_id');
    const { data, error } = uid ? await query.eq('user_id', uid) : await query;
    if (error) throw error;
    const completed: Record<string, number> = {};
    for (const r of data || []) completed[r.lesson_id] = Number(r.score) || 0;
    set({ completed, isLoading: false });
    hydrated = true;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Training] Hydration failed:', err);
    hydrated = true;
    set({ completed: loadLocal(), isLoading: false });
  } finally {
    hydrating = false;
  }
}

export const trainingActions = {
  /** Record a passed lesson (idempotent — re-passing keeps the first row). */
  async completeLesson(lessonId: string, score: number): Promise<void> {
    // Optimistic: the UI unlocks immediately either way.
    set({ completed: { ...state.completed, [lessonId]: score } });
    if (!supabase) {
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state.completed));
      } catch { /* private mode */ }
      return;
    }
    const { error } = await supabase
      .from('training_progress')
      .insert({ lesson_id: lessonId, score, user_id: (await supabase.auth.getUser()).data?.user?.id });
    if (error && !error.message.includes('duplicate')) {
      // eslint-disable-next-line no-console
      console.error('[Training] Save failed:', error);
      toast.error('Progress saved locally but not synced — check your connection.');
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state.completed));
      } catch { /* private mode */ }
    }
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  void maybeHydrate();
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => state;

export function useTraining() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
