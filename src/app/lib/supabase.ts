import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Singleton Supabase client for the frontend.
//
// Auth options are explicit so the customer portal behaves predictably:
//  - persistSession / autoRefreshToken: keep the merchant signed in across
//    reloads (session lives in localStorage).
//  - detectSessionInUrl: parse the token that lands after email confirmation
//    or a password-recovery link.
//  - flowType 'pkce': the confirmation/recovery link comes back as a `?code=`
//    query param rather than a `#access_token=` fragment, so it does NOT
//    collide with the app's HashRouter fragment.
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

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
