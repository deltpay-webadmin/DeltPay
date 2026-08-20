/**
 * Call Playbooks data hook — one reload() over the six tables the
 * playbook surfaces need. Used by the Call Playbooks page and by the
 * lead workspace's embedded Live Call.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Card, CallSession, LeadLite, Meeting, Playbook, Variant } from './core';

export interface CallPlaybooksData {
  playbooks: Playbook[];
  cards: Card[];
  variants: Variant[];
  sessions: CallSession[];
  leads: LeadLite[];
  meetings: Meeting[];
  loading: boolean;
  reload: () => Promise<void>;
}

export function useCallPlaybooksData(): CallPlaybooksData {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [sessions, setSessions] = useState<CallSession[]>([]);
  const [leads, setLeads] = useState<LeadLite[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const [pb, cd, vr, ss, ld, mt] = await Promise.all([
      supabase.from('call_playbooks').select('*').eq('is_active', true).order('product').order('industry'),
      supabase.from('playbook_cards').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('card_variants').select('*').order('created_at'),
      supabase.from('call_sessions').select('*').order('created_at', { ascending: false }).limit(2000),
      supabase.from('pipeline_leads').select('id,business_name,contact_name,contact_email,contact_phone,industry').order('business_name'),
      supabase.from('rep_meetings').select('*').order('starts_at', { ascending: true }).limit(500),
    ]);
    setPlaybooks((pb.data as Playbook[]) ?? []);
    setCards((cd.data as Card[]) ?? []);
    setVariants((vr.data as Variant[]) ?? []);
    setSessions((ss.data as CallSession[]) ?? []);
    setLeads((ld.data as LeadLite[]) ?? []);
    setMeetings((mt.data as Meeting[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { playbooks, cards, variants, sessions, leads, meetings, loading, reload };
}
