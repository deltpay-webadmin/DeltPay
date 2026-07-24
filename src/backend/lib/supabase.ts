/**
 * ────────────────────────────────────────────────────────────
 * Supabase client (backend portal)
 * ────────────────────────────────────────────────────────────
 * Re-exports the app-wide client from src/app/lib/supabase so the
 * CRM shares the signed-in user's session. RLS on the CRM tables
 * gates access on is_staff(), which requires the request to carry
 * the authenticated user's JWT — a separate non-persisting client
 * here would send anonymous requests and every read/write would be
 * denied.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as appClient } from '../../app/lib/supabase';

export const supabase: SupabaseClient | null = appClient;

export const isSupabaseConfigured = supabase !== null;
