import { useState, useEffect, useCallback } from 'react';
import type { PinnedChatData } from '../pages/SandboxPage';

/* ── localStorage keys ── */
const PINNED_KEY = 'delt-lens-pinned-chats';
const SESSIONS_KEY = 'delt-lens-chat-sessions';

/* ── Chat session type (stored in localStorage) ── */
export interface StoredChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  layer?: string;
  layerColor?: string;
  followUp?: string;
}

export interface StoredChatSession {
  id: string;
  title: string;
  messages: StoredChatMessage[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  layer?: string;
  layerColor?: string;
}

/* ── Safe JSON helpers ── */
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — silently fail */
  }
}

/* ══════════════════════════════════════════════════════════
   Hook: usePinnedChatsStorage
   Manages pinned chats in localStorage
   ══════════════════════════════════════════════════════════ */
export function usePinnedChatsStorage() {
  const [pinnedChats, setPinnedChats] = useState<PinnedChatData[]>(() =>
    loadJSON<PinnedChatData[]>(PINNED_KEY, [])
  );

  // Persist whenever pinnedChats changes
  useEffect(() => {
    saveJSON(PINNED_KEY, pinnedChats);
  }, [pinnedChats]);

  const pinChat = useCallback((chat: PinnedChatData) => {
    setPinnedChats(prev => {
      if (prev.some(c => c.id === chat.id)) return prev;
      return [...prev, chat];
    });
  }, []);

  const unpinChat = useCallback((chatId: string) => {
    setPinnedChats(prev => prev.filter(c => c.id !== chatId));
  }, []);

  return { pinnedChats, pinChat, unpinChat, setPinnedChats };
}

/* ══════════════════════════════════════════════════════════
   Hook: useChatSessionsStorage
   Manages all chat sessions (history) in localStorage
   ══════════════════════════════════════════════════════════ */
export function useChatSessionsStorage() {
  const [sessions, setSessions] = useState<StoredChatSession[]>(() =>
    loadJSON<StoredChatSession[]>(SESSIONS_KEY, [])
  );

  // Persist whenever sessions change
  useEffect(() => {
    saveJSON(SESSIONS_KEY, sessions);
  }, [sessions]);

  const saveSession = useCallback((session: StoredChatSession) => {
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === session.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = session;
        return updated;
      }
      return [session, ...prev];
    });
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  const markPinned = useCallback((sessionId: string, pinned: boolean) => {
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, pinned } : s))
    );
  }, []);

  const getSession = useCallback(
    (sessionId: string) => sessions.find(s => s.id === sessionId) || null,
    [sessions]
  );

  return { sessions, saveSession, deleteSession, markPinned, getSession };
}
