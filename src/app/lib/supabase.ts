import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Singleton Supabase client for the frontend
export const supabase = createClient(supabaseUrl, publicAnonKey);

// Base URL for the Hono edge function server
export const serverBaseUrl = `${supabaseUrl}/functions/v1/make-server-940653c6`;

// Helper for making authenticated API calls to the server
export async function serverFetch(
  route: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${serverBaseUrl}${route.startsWith('/') ? route : `/${route}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${publicAnonKey}`,
    ...(options.headers as Record<string, string> || {}),
  };
  return fetch(url, { ...options, headers });
}
